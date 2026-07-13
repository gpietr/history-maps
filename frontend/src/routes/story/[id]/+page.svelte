<script lang="ts">
  import type { PageData } from './$types'
  import type { StyleSpecification } from 'maplibre-gl'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import Map from '$lib/Map.svelte'
  import Timeline from '$lib/Timeline.svelte'
  import ChartTimeline from '$lib/ChartTimeline.svelte'
  import EventSidebar from '$lib/EventSidebar.svelte'
  import { selectedEvent } from '$lib/stores'

  let { data }: { data: PageData } = $props()

  // Deep link: adopt ?event=<id> from the URL (covers direct loads and story switches).
  $effect(() => {
    const eventId = page.url.searchParams.get('event')
    const match = eventId ? data.story.events.find((e) => e.id === eventId) : undefined
    selectedEvent.set(match ?? null)
  })

  // Keep the URL in sync with the selection so it stays shareable/bookmarkable.
  $effect(() => {
    const ev = $selectedEvent
    const current = page.url.searchParams.get('event')
    if ((ev?.id ?? null) === current) return
    const url = new URL(page.url)
    if (ev) url.searchParams.set('event', ev.id)
    else url.searchParams.delete('event')
    goto(url, { replaceState: true, keepFocus: true, noScroll: true })
  })

  const STYLES = [
    { label: 'Physical', value: 'physical' },
    { label: 'Atlas', value: 'natgeo' },
    { label: 'Satellite', value: 'satellite' },
    { label: 'Modern', value: 'modern' },
  ] as const

  type StyleKey = (typeof STYLES)[number]['value']

  let activeStyle = $state<StyleKey>('physical')

  // Each story starts on its own default base-map style; re-adopt it when switching stories.
  $effect(() => {
    activeStyle = data.story.map.defaultStyle ?? 'physical'
  })

  function esriStyle(serviceUrl: string, attribution: string, maxzoom = 19) {
    return {
      version: 8 as const,
      // Required for symbol/text layers added on top of raster tiles
      glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
      sources: {
        esri: {
          type: 'raster' as const,
          tiles: [serviceUrl],
          tileSize: 256,
          attribution,
          maxzoom,
        },
      },
      layers: [{ id: 'esri-base', type: 'raster' as const, source: 'esri' }],
    }
  }

  const STYLE_MAP = {
    // Pure physical geography — no city names, no roads, no political borders.
    // Tile service caps at zoom 8; MapLibre overzooms the zoom-8 tiles beyond that.
    physical: esriStyle(
      'https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
      'Tiles © Esri, DeLorme, NAVTEQ',
      8
    ),
    // Classic National Geographic atlas style — muted colors, minimal labels
    natgeo: esriStyle(
      'https://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      'Tiles © Esri, National Geographic',
      16
    ),
    // True-color satellite imagery — terrain is timeless even if roads aren't
    satellite: esriStyle(
      'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'Tiles © Esri, Maxar, Earthstar Geographics'
    ),
    // Modern street map — useful for orientation
    modern: 'https://tiles.openfreemap.org/styles/liberty',
  }

  function resolvedStyle(key: StyleKey): string | StyleSpecification {
    return STYLE_MAP[key] as string | StyleSpecification
  }
</script>

<div class="story-layout">
  <header class="story-header">
    <a href="/" class="back-link">← Archive</a>
    <h1 class="story-title">{data.story.title}</h1>
    <p class="story-desc">{data.story.description}</p>
    <div class="style-switcher">
      {#each STYLES as s}
        <button
          class="style-btn"
          class:active={activeStyle === s.value}
          onclick={() => (activeStyle = s.value)}
        >
          {s.label}
        </button>
      {/each}
    </div>
  </header>

  <div class="content-area">
    {#if data.story.displayMode !== 'choropleth' || data.story.choropleth?.valueFormula === 'political'}
      <EventSidebar story={data.story} />
    {/if}

    <div class="map-area">
      {#key activeStyle}
        <Map story={data.story} styleOverride={resolvedStyle(activeStyle) as string} />
      {/key}
    </div>
  </div>

  <div class="timeline-area">
    {#if data.story.displayMode === 'choropleth' && data.story.choropleth?.valueFormula !== 'political'}
      <ChartTimeline story={data.story} />
    {:else}
      <Timeline story={data.story} />
    {/if}
  </div>
</div>

<style>
  .story-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
  }

  .story-header {
    padding: 7px 16px;
    border-bottom: 1px solid var(--border-dim);
    background: var(--surface);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .back-link {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--fg-mid);
    text-decoration: none;
    white-space: nowrap;
    transition: color 0.15s;
  }

  .back-link:hover {
    color: var(--brass);
  }

  .story-title {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 500;
    color: var(--fg);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.02em;
  }

  .story-desc {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--fg-mid);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .style-switcher {
    display: flex;
    gap: 0;
    flex-shrink: 0;
    background: var(--bg);
    padding: 2px;
    border: 1px solid var(--border);
  }

  .style-btn {
    padding: 4px 10px;
    font-family: var(--font-mono);
    font-size: 0.63rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: none;
    cursor: pointer;
    background: transparent;
    color: var(--fg-dim);
    transition: background 0.15s, color 0.15s;
  }

  .style-btn:hover {
    color: var(--fg);
    background: var(--raised);
  }

  .style-btn.active {
    background: var(--raised);
    color: var(--fg);
    border-left: 2px solid var(--brass);
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: row;
    min-height: 0;
    overflow: hidden;
  }

  .map-area {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .timeline-area {
    flex-shrink: 0;
  }
</style>
