<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import type { StyleSpecification } from 'maplibre-gl'
  import type { Story, StoryEvent } from '@fact-o-map/types'
  import { selectedEvent } from './stores'

  let { story, styleOverride = undefined }: { story: Story; styleOverride?: string | StyleSpecification } = $props()

  const isChoropleth = $derived(story.displayMode === 'choropleth')

  function resolveStyle(): string | StyleSpecification {
    if (styleOverride) return styleOverride
    if (story.map.styleUrl) return story.map.styleUrl
    const key = import.meta.env.VITE_STADIA_API_KEY
    if (key) return `https://tiles.stadiamaps.com/styles/stamen_terrain.json?api_key=${key}`
    return import.meta.env.VITE_DEFAULT_MAP_STYLE ?? 'https://tiles.openfreemap.org/styles/fiord'
  }

  // --- Choropleth helpers ---

  // Measured 1951–1980 mean annual temperature (°C) for major countries.
  // Land masses run warmer than the global ocean-weighted lat→temp curve, so we hardcode
  // the well-known ones and fall back to the lat formula for unnamed/small countries.
  const COUNTRY_BASELINE: Record<string, number> = {
    'Russia': -5.5, 'Canada': -4.5, 'United States of America': 8.5,
    'Brazil': 25.5, 'Australia': 21.5, 'China': 7.5, 'India': 25.0,
    'Argentina': 14.0, 'Kazakhstan': 3.5, 'Algeria': 22.5,
    'Dem. Rep. Congo': 24.5, 'Saudi Arabia': 26.5, 'Mexico': 21.0,
    'Indonesia': 26.5, 'Sudan': 28.0, 'Libya': 22.5, 'Iran': 17.5,
    'Mongolia': -0.5, 'Peru': 18.0, 'Chad': 28.0, 'Niger': 29.0,
    'Angola': 22.0, 'Mali': 29.0, 'South Africa': 17.5, 'Colombia': 24.0,
    'Ethiopia': 22.5, 'Bolivia': 15.5, 'Mauritania': 28.5, 'Egypt': 22.0,
    'Tanzania': 22.5, 'Nigeria': 27.0, 'Venezuela': 26.0, 'Pakistan': 20.0,
    'Mozambique': 22.5, 'Turkey': 12.5, 'Chile': 8.5, 'Zambia': 21.5,
    'Myanmar': 23.5, 'Afghanistan': 12.5, 'Somalia': 27.5, 'Ukraine': 7.5,
    'Germany': 8.5, 'France': 11.5, 'Spain': 14.0, 'Poland': 8.0,
    'United Kingdom': 9.0, 'Italy': 13.5, 'Romania': 9.5, 'Hungary': 10.5,
    'Belarus': 6.0, 'Czech Republic': 8.5, 'Serbia': 11.0, 'Bulgaria': 10.5,
    'Sweden': 2.5, 'Norway': 1.5, 'Finland': 1.0, 'Japan': 11.5,
    'South Korea': 11.0, 'North Korea': 5.5,
  }

  // Approximate mean annual temperature (°C) from absolute latitude — used as fallback.
  function latBaseline(absLat: number): number {
    const table: [number, number][] = [
      [0, 27], [10, 26], [20, 22], [30, 17],
      [40, 12], [50, 7],  [60, 1],  [70, -10], [80, -22], [90, -35],
    ]
    for (let i = 1; i < table.length; i++) {
      if (absLat <= table[i][0]) {
        const t = (absLat - table[i - 1][0]) / (table[i][0] - table[i - 1][0])
        return table[i - 1][1] + t * (table[i][1] - table[i - 1][1])
      }
    }
    return -35
  }

  function baselineTemp(absLat: number, name?: string): number {
    if (name && COUNTRY_BASELINE[name] !== undefined) return COUNTRY_BASELINE[name]
    return latBaseline(absLat)
  }

  function centroidLat(feature: { geometry: { coordinates: unknown } }): number {
    const lats: number[] = []
    const collect = (c: unknown): void => {
      if (!Array.isArray(c)) return
      if (typeof c[0] === 'number') { lats.push(c[1] as number); return }
      c.forEach(collect)
    }
    collect(feature.geometry.coordinates)
    return lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0
  }

  // Shoelace formula on a single ring — returns area in square degrees.
  function ringArea(ring: number[][]): number {
    let a = 0
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
    }
    return Math.abs(a / 2)
  }

  function featureArea(feature: { geometry: { type: string; coordinates: unknown } }): number {
    const g = feature.geometry
    if (g.type === 'Polygon') return ringArea((g.coordinates as number[][][])[0])
    if (g.type === 'MultiPolygon')
      return (g.coordinates as number[][][][]).reduce((s, p) => s + ringArea(p[0]), 0)
    return 0
  }

  // Centroid of the single largest polygon ring — avoids placing multiple labels across islands.
  function largestRingCentroid(feature: { geometry: { type: string; coordinates: unknown } }): [number, number] {
    const g = feature.geometry
    const rings: number[][][] =
      g.type === 'Polygon'
        ? [(g.coordinates as number[][][])[0]]
        : (g.coordinates as number[][][][]).map((p) => p[0])
    let best = rings[0], bestA = 0
    for (const r of rings) { const a = ringArea(r); if (a > bestA) { bestA = a; best = r } }
    const cx = best.reduce((s, c) => s + c[0], 0) / best.length
    const cy = best.reduce((s, c) => s + c[1], 0) / best.length
    return [cx, cy]
  }

  // MapLibre expression: colour by (feature baseline + current global anomaly).
  // The anomaly literal changes each year; base is fixed per feature in the GeoJSON.
  function colorExpression(anomaly: number): unknown[] {
    return [
      'interpolate', ['linear'],
      ['+', ['get', 'base'], anomaly],
      -30, '#313695',
      -15, '#4575b4',
      -5,  '#74add1',
      5,   '#e0f3f8',
      15,  '#ffffbf',
      22,  '#fdae61',
      28,  '#d73027',
      38,  '#a50026',
    ]
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
  // $state so Svelte re-renders label text when the year changes — no MapLibre involvement.
  let currentAnomaly = $state(0)
  // Fixed centroid positions computed once; HTML overlay positions recomputed on map move.
  let allCentroids: Array<{ name: string; base: number; area: number; lng: number; lat: number }> = []
  let labelOverlays = $state<Array<{ name: string; base: number; lng: number; lat: number; x: number; y: number }>>([])

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

  function applyAnomaly(anomaly: number) {
    if (!map) return
    currentAnomaly = anomaly
    map.setPaintProperty('temperature-fill', 'fill-color', colorExpression(anomaly))
    // Label text is derived in the template from currentAnomaly — no MapLibre update needed.
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

      if (isChoropleth) {
        // Tag each feature with its latitude-derived baseline temperature
        const geoJson = await fetch(
          'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
        ).then((r) => r.json())
        type RawFeature = { geometry: { type: string; coordinates: unknown }; properties: Record<string, unknown> }
        geoJson.features = geoJson.features.map((f: RawFeature) => {
          const name = f.properties.name as string | undefined
          const base = baselineTemp(Math.abs(centroidLat(f)), name)
          const area = featureArea(f)
          return { ...f, properties: { ...f.properties, base, area } }
        })

        // Fill layer — purely paint-driven, source data never changes after load.
        map.addSource('world-land', { type: 'geojson', data: geoJson })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.addLayer({ id: 'temperature-fill', type: 'fill', source: 'world-land',
          paint: { 'fill-color': colorExpression(0) as any, 'fill-opacity': 0.75 } })

        // Labels are HTML overlays (see template) — no MapLibre symbol layer.
        // Compute one centroid per country from the largest polygon ring.
        allCentroids = (geoJson.features as RawFeature[]).map((f) => {
          const [lng, lat] = largestRingCentroid(f)
          return {
            name: f.properties.name as string,
            base: f.properties.base as number,
            area: f.properties.area as number,
            lng, lat,
          }
        })
        updateLabelPositions()
        map.on('move', updateLabelPositions)

        // Tooltip — fill layer has no symbol layer on top, so mousemove fires cleanly.
        hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

        map.on('mousemove', 'temperature-fill', (e) => {
          if (!map || !e.features?.[0]) return
          map.getCanvas().style.cursor = 'crosshair'
          const props = e.features[0].properties as Record<string, unknown>
          const base = (props.base as number) ?? 0
          const temp = (Math.round((base + currentAnomaly) * 10) / 10).toFixed(1)
          const name = (props.name as string) ?? ''
          hoverPopup!
            .setLngLat(e.lngLat)
            .setHTML(`<div style="font-family:'Spectral',Georgia,serif;font-size:12px"><strong style="font-family:'Cormorant Garamond',Georgia,serif;font-size:14px;font-weight:500;color:#e4d8bc">${name}</strong><br><span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#f4a582">${temp}°C</span></div>`)
            .addTo(map)
        })
        map.on('mouseleave', 'temperature-fill', () => {
          if (map) map.getCanvas().style.cursor = ''
          hoverPopup?.remove()
        })

        const current = get(selectedEvent)
        if (current?.value !== undefined) applyAnomaly(current.value)
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
      if (!ev || ev.value === undefined) return
      if (!map.isStyleLoaded() || !map.getLayer('temperature-fill')) return
      applyAnomaly(ev.value)
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
  {#if isChoropleth}
    {#each labelOverlays as label (label.name)}
      <span class="country-label" style="left:{label.x.toFixed(0)}px;top:{label.y.toFixed(0)}px">
        {(label.base + currentAnomaly).toFixed(1)}°C
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
