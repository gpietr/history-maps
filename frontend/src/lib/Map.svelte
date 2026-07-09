<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Story, StoryEvent } from '@chronomap/types'
  import { selectedEvent } from './stores'

  let { story, styleOverride = undefined }: { story: Story; styleOverride?: string | object } = $props()

  function resolveStyle(): string | object {
    if (styleOverride) return styleOverride
    if (story.map.styleUrl) return story.map.styleUrl
    const key = import.meta.env.VITE_STADIA_API_KEY
    if (key) return `https://tiles.stadiamaps.com/styles/stamen_terrain.json?api_key=${key}`
    return import.meta.env.VITE_DEFAULT_MAP_STYLE ?? 'https://tiles.openfreemap.org/styles/fiord'
  }

  let container: HTMLDivElement
  let map: import('maplibre-gl').Map | null = null
  let markers: import('maplibre-gl').Marker[] = []

  const CATEGORY_COLORS: Record<string, string> = {
    landing: '#3b82f6',
    battle: '#ef4444',
    victory: '#22c55e',
    military: '#a855f7',
    life: '#f59e0b',
    education: '#06b6d4',
    achievement: '#f97316',
  }

  function colorFor(event: StoryEvent) {
    return CATEGORY_COLORS[event.category ?? ''] ?? '#6b7280'
  }

  function makeMarkerEl(event: StoryEvent) {
    // Outer wrapper: MapLibre owns this element's transform for positioning.
    // Never touch wrapper.style.transform or the marker jumps to (0,0).
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'width: 14px; height: 14px; cursor: pointer;'

    // Inner dot: safe to scale independently.
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

    map.on('load', () => {
      if (!map) return

      for (const event of story.events) {
        if (!event.location || event.location.type !== 'point') continue
        const coords = event.location.coordinates as [number, number]

        const el = makeMarkerEl(event)
        const popup = new maplibregl.Popup({ offset: 16, closeButton: false })
          .setHTML(`
            <div>
              <p style="margin:0 0 4px;font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:0.05em">
                ${event.category ?? 'event'} · ${new Date(event.timestamp).getFullYear()}
              </p>
              <strong style="font-size:14px;line-height:1.3">${event.title}</strong>
              ${event.description ? `<p style="margin:6px 0 0;font-size:13px;color:#8b949e;line-height:1.4">${event.description}</p>` : ''}
            </div>
          `)

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('click', () => {
          selectedEvent.set(event)
        })

        markers.push(marker)
      }
    })
  })

  onDestroy(() => {
    markers.forEach((m) => m.remove())
    map?.remove()
  })

  $effect(() => {
    const ev = $selectedEvent
    if (!ev || !map || !ev.location) return
    const coords = ev.location.coordinates as [number, number]
    map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 10), duration: 1200 })
    markers.find((m) => {
      const lngLat = m.getLngLat()
      return lngLat.lng === coords[0] && lngLat.lat === coords[1]
    })?.togglePopup()
  })
</script>

<div bind:this={container} class="w-full h-full"></div>
