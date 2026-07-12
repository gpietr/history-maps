<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import type { StyleSpecification } from 'maplibre-gl'
  import type { ChoroplethConfig, Story, StoryEvent } from '@fact-o-map/types'
  import { selectedEvent } from './stores'
  import { BASE } from './api'

  let { story, styleOverride = undefined }: { story: Story; styleOverride?: string | StyleSpecification } = $props()

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
  // features gets a deterministic hashed colour. Rebuilt on every era change since the
  // set of names present can change, but names never remap to a different colour.
  function buildPoliticalExpression(cfg: ChoroplethConfig, features: { properties?: Record<string, unknown> }[]): unknown[] {
    const explicit = cfg.polities ?? {}
    const seen = new Set(Object.keys(explicit))
    const pairs = Object.entries(explicit).flatMap(([name, color]) => [name, color])
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

  // --- Event-mode marker helpers ---
  const CATEGORY_COLORS: Record<string, string> = {
    landing: '#3b82f6', battle: '#ef4444', victory: '#22c55e',
    military: '#a855f7', life: '#f59e0b', education: '#06b6d4', achievement: '#f97316',
  }

  function colorFor(event: StoryEvent) {
    return CATEGORY_COLORS[event.category ?? ''] ?? '#6b7280'
  }

  function makeMarkerEl(event: StoryEvent) {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'width: 14px; height: 14px; cursor: pointer;'
    const dot = document.createElement('div')
    dot.style.cssText = `
      width: 14px; height: 14px;
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
  let map: import('maplibre-gl').Map | null = null
  let markers: import('maplibre-gl').Marker[] = []
  let hoverPopup: import('maplibre-gl').Popup | null = null
  // Keyed by event id so $effect can open the popup when the timeline is clicked.
  let eventPopupMap: Map<string, import('maplibre-gl').Popup> = new Map()
  // $state so Svelte re-renders label text when the value changes.
  let currentValue = $state(0)
  // Incremented on each political-era fetch; stale responses are discarded.
  let fetchSerial = 0
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
  }

  async function applyPoliticalEra(ev: StoryEvent, cfg: ChoroplethConfig) {
    if (!ev.eraKey) return
    const serial = ++fetchSerial
    const url = `${BASE}${cfg.geoJsonUrl}/${ev.eraKey}`
    const geoJson = await fetch(url).then((r) => r.json())
    if (serial !== fetchSerial || !map) return  // superseded by a newer click
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

  onMount(async () => {
    const maplibregl = (await import('maplibre-gl')).default

    map = new maplibregl.Map({
      container,
      style: resolveStyle(),
      center: story.map.center,
      zoom: story.map.zoom,
      bearing: story.map.bearing ?? 0,
      pitch: story.map.pitch ?? 0,
    })

    map.on('load', async () => {
      if (!map) return

      if (isChoropleth && story.choropleth) {
        const cfg = story.choropleth
        type AugFeature = { properties: Record<string, unknown> }

        // For political mode: fetch the first era's historical GeoJSON by year.
        // For other modes: fetch the single augmented GeoJSON.
        const firstEvent = get(selectedEvent) ?? story.events[0]
        const initialUrl = cfg.valueFormula === 'political'
          ? `${BASE}${cfg.geoJsonUrl}/${firstEvent?.eraKey ?? ''}`
          : `${BASE}${cfg.geoJsonUrl}`
        const geoJson = await fetch(initialUrl).then((r) => r.json())

        // Political mode: SUBJECTO → colour, rebuilt on every era change (see applyPoliticalEra).
        // Other modes: numeric interpolation updated via setPaintProperty.
        const colorExpr = cfg.valueFormula === 'political'
          ? buildPoliticalExpression(cfg, geoJson.features)
          : buildColorExpression(0, cfg)

        map.addSource('choropleth-source', { type: 'geojson', data: geoJson })
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
        }

        // Tooltip
        hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

        map.on('mousemove', 'choropleth-fill', (e) => {
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
        })
        map.on('mouseleave', 'choropleth-fill', () => {
          if (map) map.getCanvas().style.cursor = ''
          hoverPopup?.remove()
        })

        const current = get(selectedEvent) ?? story.events[0]
        if (current) applyEvent(current)
      } else {
        for (const event of story.events) {
          if (!event.location || event.location.type !== 'point') continue
          const coords = event.location.coordinates as [number, number]
          const el = makeMarkerEl(event)
          const popup = new maplibregl.Popup({ offset: 16, closeButton: false, closeOnClick: false })
            .setLngLat(coords)
            .setHTML(`
              <div>
                <p style="margin:0 0 5px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:#a0906e;text-transform:uppercase;letter-spacing:0.09em">
                  ${event.category ?? 'event'} · ${new Date(event.timestamp).getFullYear()}
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

          el.addEventListener('mouseenter', () => { cancelHide(); popup.addTo(map!) })
          el.addEventListener('mouseleave', scheduleHide)
          popup.on('open', () => {
            const popupEl = popup.getElement()
            if (popupEl) {
              popupEl.addEventListener('mouseenter', cancelHide)
              popupEl.addEventListener('mouseleave', scheduleHide)
            }
          })

          // Click still selects the event (sidebar highlight + flyTo).
          el.addEventListener('click', () => selectedEvent.set(event))

          const marker = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map)
          markers.push(marker)
        }
      }
    })
  })

  onDestroy(() => {
    markers.forEach((m) => m.remove())
    eventPopupMap.forEach((p) => p.remove())
    eventPopupMap.clear()
    hoverPopup?.remove()
    map?.remove()
  })

  $effect(() => {
    const ev = $selectedEvent
    if (!map) return

    if (isChoropleth) {
      if (!ev) return
      if (!map.isStyleLoaded() || !map.getLayer('choropleth-fill')) return
      if (story.choropleth?.valueFormula !== 'political' && ev.value === undefined) return
      applyEvent(ev)
    } else {
      if (!ev || !ev.location) return
      const coords = ev.location.coordinates as [number, number]
      map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 10), duration: 1200 })
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
