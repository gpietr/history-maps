<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import type { StyleSpecification } from 'maplibre-gl'
  // MapLibre 6 locates its worker relative to its own module URL, which breaks once Vite
  // pre-bundles or hashes it. Emit the worker as an asset and hand MapLibre the URL instead.
  import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
  import type { ChoroplethConfig, Story, StoryEvent } from '@fact-o-map/types'
  import { selectedEvent } from './stores'
  import { BASE } from './api'
  import { colorFor } from './categories'
  import { formatEventDate } from './format'

  let { story, styleOverride = undefined, globe = false }: {
    story: Story
    styleOverride?: string | StyleSpecification
    /** Render on a 3D globe instead of the flat Mercator map */
    globe?: boolean
  } = $props()

  const isChoropleth = $derived(story.displayMode === 'choropleth')

  function resolveStyle(): string | StyleSpecification {
    if (styleOverride) return styleOverride
    if (story.map.styleUrl) return story.map.styleUrl
    const key = import.meta.env.VITE_STADIA_API_KEY
    if (key) return `https://tiles.stadiamaps.com/styles/stamen_terrain.json?api_key=${key}`
    return import.meta.env.VITE_DEFAULT_MAP_STYLE ?? 'https://tiles.openfreemap.org/styles/fiord'
  }

  // --- Generic choropleth helpers ---

  // Build a MapLibre fill-color expression from the story's choropleth config.
  function buildColorExpression(value: number, cfg: ChoroplethConfig): unknown[] {
    let inputExpr: unknown
    switch (cfg.valueFormula) {
      case 'localAnomaly':
        // Polar amplification: amp = 1 + 2×|lat|/90 → equator 1×, poles 3×
        inputExpr = ['*', value, ['+', 1, ['*', 2, ['/', ['abs', ['get', 'lat']], 90]]]]
        break
      default:
        inputExpr = value
    }
    return ['interpolate', ['linear'], inputExpr, ...cfg.colorStops.flat()]
  }

  // Deterministic name -> colour, so any polity without an explicit entry still gets
  // a stable, distinct colour instead of falling back to flat grey — and the same
  // name always hashes to the same colour, so it stays consistent across era changes.
  function hashColor(name: string): string {
    let h = 2166136261
    for (let i = 0; i < name.length; i++) {
      h ^= name.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const hue = Math.abs(h) % 360
    return `hsl(${hue}, 42%, 40%)`
  }

  // Build a MapLibre match expression for categorical (political) mode.
  // Reads the SUBJECTO property (from aourednik historical-basemaps GeoJSON) and maps it to a colour.
  // Explicit entries from cfg.polities win; every other name found in the current era's
  // features gets cfg.othersColor if set, else a deterministic hashed colour. Rebuilt on every
  // era change since the set of names present can change, but names never remap to a different colour.
  function buildPoliticalExpression(cfg: ChoroplethConfig, features: { properties?: Record<string, unknown> }[]): unknown[] {
    const explicit = cfg.polities ?? {}
    const pairs = Object.entries(explicit).flatMap(([name, color]) => [name, color])
    if (cfg.othersColor) return ['match', ['get', 'SUBJECTO'], ...pairs, cfg.othersColor]
    const seen = new Set(Object.keys(explicit))
    for (const f of features) {
      const name = f.properties?.SUBJECTO as string | undefined
      if (!name || seen.has(name)) continue
      seen.add(name)
      pairs.push(name, hashColor(name))
    }
    return ['match', ['get', 'SUBJECTO'], ...pairs, '#6B6B6B']
  }

  // Mirror of the MapLibre formula in plain JS — used for tooltip and label text.
  function computeDisplayValue(value: number, cfg: ChoroplethConfig, lat: number): number {
    switch (cfg.valueFormula) {
      case 'localAnomaly':
        return value * (1 + 2 * Math.abs(lat) / 90)
      default:
        return value
    }
  }

  // --- Event marker helpers ---
  function makeMarkerEl(event: StoryEvent) {
    const wrapper = document.createElement('div')
    // On touch screens the wrapper is a larger, invisible hit area centred on the 14px dot.
    const hit = matchMedia('(pointer: coarse)').matches ? 32 : 14
    wrapper.style.cssText = `width: ${hit}px; height: ${hit}px; cursor: pointer; display: flex; align-items: center; justify-content: center;`
    const dot = document.createElement('div')
    dot.style.cssText = `
      width: 14px; height: 14px; flex-shrink: 0;
      background: ${colorFor(event)};
      border: 2px solid rgba(255,255,255,0.8);
      border-radius: 50%;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    `
    wrapper.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(1.4)'
      dot.style.boxShadow = `0 0 0 6px ${colorFor(event)}33`
    })
    wrapper.addEventListener('mouseleave', () => {
      dot.style.transform = ''
      dot.style.boxShadow = ''
    })
    wrapper.appendChild(dot)
    return wrapper
  }

  // --- Component state ---
  let container: HTMLDivElement
  let destroyed = false
  let map: import('maplibre-gl').Map | null = null
  let markers: import('maplibre-gl').Marker[] = []
  let hoverPopup: import('maplibre-gl').Popup | null = null
  // Keyed by event id so $effect can open the popup when the timeline is clicked.
  let eventPopupMap: Map<string, import('maplibre-gl').Popup> = new Map()
  // $state so Svelte re-renders label text when the value changes.
  let currentValue = $state(0)
  // Incremented on each political-era fetch; stale responses are discarded.
  let fetchSerial = 0
  // Era shown (or being fetched), so events sharing an era don't re-download the same GeoJSON.
  let requestedEraKey: string | undefined
  // Projections can only be set once the style has loaded; the globe $effect waits for it.
  let styleReady = $state(false)
  // Set once the load handler has added layers and markers; the selection $effect waits for it.
  let ready = $state(false)
  // Fixed centroid positions computed once; HTML overlay positions recomputed on map move.
  let allCentroids: Array<{ name: string; area: number; lng: number; lat: number }> = []
  let labelOverlays = $state<Array<{ name: string; lng: number; lat: number; x: number; y: number }>>([])

  function updateLabelPositions() {
    if (!map) return
    const canvas = map.getCanvas()
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    // Area threshold (sq-degrees) drops by half per zoom step.
    // Anchored so threshold = 40 at zoom 1.5 → France (~70) visible at world view,
    // Hungary (~13) at zoom ~3, Netherlands (~5) at zoom ~4.5.
    const threshold = 40 * Math.pow(2, -(map.getZoom() - 1.5))
    labelOverlays = allCentroids
      .filter((c) => c.area >= threshold)
      .map((c) => { const { x, y } = map!.project([c.lng, c.lat]); return { ...c, x, y } })
      .filter((l) => l.x > -20 && l.x < W + 20 && l.y > -20 && l.y < H + 20)
      .filter((l) => !globe || !isOnFarSide(l))
  }

  // On the globe, project() also returns screen positions for points on the far side. Mapping the
  // pixel back with unproject() hits the visible surface instead, so a far-side point doesn't round-trip.
  function isOnFarSide(l: { lng: number; lat: number; x: number; y: number }) {
    const back = map!.unproject([l.x, l.y])
    const dLng = Math.abs(((back.lng - l.lng + 540) % 360) - 180)
    return Math.abs(back.lat - l.lat) > 1 || dLng > 1
  }

  async function applyPoliticalEra(ev: StoryEvent, cfg: ChoroplethConfig) {
    if (!ev.eraKey || ev.eraKey === requestedEraKey) return
    requestedEraKey = ev.eraKey
    const serial = ++fetchSerial
    const url = `${BASE}${cfg.geoJsonUrl}/${ev.eraKey}`
    const geoJson = await fetch(url).then((r) => r.json())
    if (serial !== fetchSerial || destroyed || !map) return  // superseded by a newer click, or unmounted
    const source = map.getSource('choropleth-source') as import('maplibre-gl').GeoJSONSource
    source.setData(geoJson)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setPaintProperty('choropleth-fill', 'fill-color', buildPoliticalExpression(cfg, geoJson.features) as any)
  }

  function applyEvent(ev: StoryEvent) {
    if (!map || !story.choropleth) return
    const cfg = story.choropleth
    currentValue = ev.value ?? 0
    if (cfg.valueFormula === 'political') {
      applyPoliticalEra(ev, cfg)  // fire-and-forget; stale results are discarded via fetchSerial
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.setPaintProperty('choropleth-fill', 'fill-color', buildColorExpression(ev.value ?? 0, cfg) as any)
    }
  }

  const stopPropagation = (e: Event) => e.stopPropagation()

  // Point markers with hover popups. Political maps get them too, drawn over the territory layer.
  function addEventMarkers(maplibregl: typeof import('maplibre-gl')) {
    for (const event of story.events) {
      if (!event.location || event.location.type !== 'point') continue
      const coords = event.location.coordinates as [number, number]
      const el = makeMarkerEl(event)
      const popup = new maplibregl.Popup({ offset: 16, closeButton: false, closeOnClick: false })
        .setLngLat(coords)
        .setHTML(`
          <div>
            <p style="margin:0 0 5px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#a0906e;text-transform:uppercase;letter-spacing:0.09em">
              ${event.category ?? 'event'} · ${formatEventDate(event)}
            </p>
            <strong style="font-family:'Cormorant Garamond',Georgia,serif;font-size:15px;font-weight:500;line-height:1.25;color:#e4d8bc;display:block">${event.title}</strong>
            ${event.description ? `<p style="margin:6px 0 0;font-family:'Spectral',Georgia,serif;font-size:12px;color:#a0906e;line-height:1.5">${event.description}</p>` : ''}
          </div>
        `)

      eventPopupMap.set(event.id, popup)

      // Show popup on hover; keep it open while the cursor is over the dot OR the popup.
      let hideTimer: ReturnType<typeof setTimeout> | null = null
      const cancelHide = () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null } }
      const scheduleHide = () => { cancelHide(); hideTimer = setTimeout(() => popup.remove(), 180) }

      el.addEventListener('mouseenter', () => { cancelHide(); hoverPopup?.remove(); popup.addTo(map!) })
      el.addEventListener('mouseleave', scheduleHide)
      // Marker and popup sit inside the map container: keep their mouse moves from also
      // triggering the choropleth territory tooltip underneath.
      el.addEventListener('mousemove', stopPropagation)
      popup.on('open', () => {
        const popupEl = popup.getElement()
        if (popupEl) {
          popupEl.addEventListener('mouseenter', cancelHide)
          popupEl.addEventListener('mouseleave', scheduleHide)
          popupEl.addEventListener('mousemove', stopPropagation)
        }
      })

      // Click still selects the event (sidebar highlight + flyTo). Kept from reaching the map,
      // where it would also open the territory tooltip underneath.
      el.addEventListener('click', (e) => { e.stopPropagation(); selectedEvent.set(event) })

      const marker = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map!)
      markers.push(marker)
    }
  }

  onMount(async () => {
    const maplibregl = await import('maplibre-gl')
    maplibregl.setWorkerUrl(maplibreWorkerUrl)
    // The component may have been destroyed while the import was pending.
    if (destroyed) return

    map = new maplibregl.Map({
      container,
      style: resolveStyle(),
      center: story.map.center,
      zoom: story.map.zoom,
      bearing: story.map.bearing ?? 0,
      pitch: story.map.pitch ?? 0,
    })

    map.on('style.load', () => { styleReady = true })

    map.on('load', async () => {
      if (!map) return

      if (isChoropleth && story.choropleth) {
        const cfg = story.choropleth
        type AugFeature = { properties: Record<string, unknown> }

        // For political mode: fetch the first era's historical GeoJSON by year.
        // For other modes: fetch the single augmented GeoJSON.
        const firstEvent = get(selectedEvent) ?? story.events[0]
        if (cfg.valueFormula === 'political') requestedEraKey = firstEvent?.eraKey
        const initialUrl = cfg.valueFormula === 'political'
          ? `${BASE}${cfg.geoJsonUrl}/${firstEvent?.eraKey ?? ''}`
          : `${BASE}${cfg.geoJsonUrl}`
        const geoJson = await fetch(initialUrl).then((r) => r.json())
        // The component may have been destroyed (e.g. style switch) while the fetch was pending.
        if (destroyed || !map) return

        // Political mode: SUBJECTO → colour, rebuilt on every era change (see applyPoliticalEra).
        // Other modes: numeric interpolation updated via setPaintProperty.
        const colorExpr = cfg.valueFormula === 'political'
          ? buildPoliticalExpression(cfg, geoJson.features)
          : buildColorExpression(0, cfg)

        map.addSource('choropleth-source', { type: 'geojson', data: geoJson, attribution: cfg.attribution })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addLayer({ id: 'choropleth-fill', type: 'fill', source: 'choropleth-source',
          paint: { 'fill-color': colorExpr as any, 'fill-opacity': 0.75 } })

        // Centroids (for numeric anomaly labels only — not used in political mode).
        if (cfg.valueFormula !== 'political') {
          allCentroids = (geoJson.features as AugFeature[]).map((f) => ({
            name: f.properties.name as string,
            area: f.properties.area as number,
            lat: f.properties.lat as number,
            lng: f.properties.lng as number,
          }))
          updateLabelPositions()
          map.on('move', updateLabelPositions)
          // Switching globe/flat (or MapLibre's own globe→flat blend when zooming) moves every
          // point on screen without a 'move' event.
          map.on('projectiontransition', updateLabelPositions)
        }

        // Tooltip
        hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

        // Hover on desktop; touch screens have no hover, so a tap shows the same tooltip.
        const showTooltip = (e: import('maplibre-gl').MapLayerMouseEvent) => {
          if (!map || !e.features?.[0]) return
          map.getCanvas().style.cursor = 'crosshair'
          const props = e.features[0].properties as Record<string, unknown>
          const name = ((props.NAME ?? props.name) as string) ?? ''
          let valueLabel: string
          if (cfg.valueFormula === 'political') {
            valueLabel = (props.SUBJECTO as string) ?? 'Independent'
          } else {
            const lat = (props.lat as number) ?? 0
            const display = computeDisplayValue(currentValue, cfg, lat)
            const sign = display >= 0 ? '+' : ''
            valueLabel = `${sign}${display.toFixed(2)}${cfg.unit ?? ''}`
          }
          hoverPopup!
            .setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:'Spectral',Georgia,serif;font-size:12px"><strong style="font-family:'Cormorant Garamond',Georgia,serif;font-size:14px;font-weight:500;color:#e4d8bc">${name}</strong><br><span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#f4a582">${valueLabel}</span></div>`)
            .addTo(map)
        }
        map.on('mousemove', 'choropleth-fill', showTooltip)
        map.on('click', 'choropleth-fill', showTooltip)
        // Tapping outside any territory (e.g. open sea) dismisses it.
        map.on('click', (e) => {
          if (map && !map.queryRenderedFeatures(e.point, { layers: ['choropleth-fill'] }).length) hoverPopup?.remove()
        })
        map.on('mouseleave', 'choropleth-fill', () => {
          if (map) map.getCanvas().style.cursor = ''
          hoverPopup?.remove()
        })

        // Numeric modes start on the first event; political mode already fetched the right era above.
        // A selected event is applied by the $effect once `ready` flips.
        if (cfg.valueFormula !== 'political' && !get(selectedEvent) && story.events[0]) applyEvent(story.events[0])

        // Political borders are dense; a thin outline keeps neighbouring polities readable.
        if (cfg.valueFormula === 'political') {
          map.addLayer({ id: 'choropleth-line', type: 'line', source: 'choropleth-source',
            paint: { 'line-color': 'rgba(30, 22, 14, 0.55)', 'line-width': 0.6 } })
        }
      }
      addEventMarkers(maplibregl)
      ready = true
    })
  })

  onDestroy(() => {
    destroyed = true
    markers.forEach((m) => m.remove())
    eventPopupMap.forEach((p) => p.remove())
    eventPopupMap.clear()
    hoverPopup?.remove()
    map?.remove()
    map = null
  })

  // Toggled in place (no remount): markers, layers and the camera survive the switch.
  $effect(() => {
    const projection = globe ? 'globe' : 'mercator'
    if (!styleReady || !map) return
    map.setProjection({ type: projection })
    // Reposition HTML labels once the new projection has drawn (they also depend on `globe`).
    map.once('render', updateLabelPositions)
  })

  $effect(() => {
    const ev = $selectedEvent
    if (!ready || !map || !ev) return

    if (isChoropleth && map.getLayer('choropleth-fill')
        && (story.choropleth?.valueFormula === 'political' || ev.value !== undefined)) {
      applyEvent(ev)
    }

    if (ev.location?.type === 'point') {
      const coords = ev.location.coordinates as [number, number]
      // Choropleth stories are continent-scale: pan without zooming in unless the event asks to.
      const zoom = ev.location.zoom ?? (isChoropleth ? map.getZoom() : Math.max(map.getZoom(), 10))
      map.flyTo({ center: coords, zoom, duration: 1200 })
      // Close any open popup then show the one for this event.
      // Covers timeline and sidebar clicks; for hover clicks it just re-shows the same popup.
      eventPopupMap.forEach((p) => p.remove())
      eventPopupMap.get(ev.id)?.addTo(map)
    }
  })
</script>

<div class="map-root">
  <div bind:this={container} class="w-full h-full"></div>
  {#if isChoropleth && story.choropleth?.valueFormula !== 'political'}
    {#each labelOverlays as label (label.name)}
      {@const display = story.choropleth ? computeDisplayValue(currentValue, story.choropleth, label.lat) : currentValue}
      {@const unit = story.choropleth?.unit ?? ''}
      <span class="country-label" style="left:{label.x.toFixed(0)}px;top:{label.y.toFixed(0)}px">
        {display >= 0 ? '+' : ''}{display.toFixed(1)}{unit}
      </span>
    {/each}
  {/if}
</div>

<style>
  .map-root {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .country-label {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1;
    font-size: 11px;
    font-weight: 700;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    color: #fff;
    text-shadow:
      0 0 3px rgba(0,0,0,0.95),
      0 0 3px rgba(0,0,0,0.95),
      0 0 3px rgba(0,0,0,0.95);
    white-space: nowrap;
    line-height: 1;
  }
  /* Popup must sit above the label overlays */
  .map-root :global(.maplibregl-popup) {
    z-index: 2;
  }
</style>
