<script lang="ts">
  import type { PageData } from './$types'
  import type { StyleSpecification } from 'maplibre-gl'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { get } from 'svelte/store'
  import Map from '#lib/Map.svelte'
  import Timeline from '#lib/Timeline.svelte'
  import ChartTimeline from '#lib/ChartTimeline.svelte'
  import EventSidebar from '#lib/EventSidebar.svelte'
  import { selectedEvent } from '#lib/stores.ts'

  let { data }: { data: PageData } = $props()

  // Deep link: adopt ?event=<id> from the URL (covers direct loads and story switches).
  $effect(() => {
    const eventId = page.url.searchParams.get('event')
    const match = eventId ? data.story.events.find((e) => e.id === eventId) : undefined
    // The URL-sync effect below rewrites the URL on every selection, which re-runs this one;
    // re-setting the same event would make the store notify again (objects always count as changed).
    if (get(selectedEvent) === (match ?? null)) return
    selectedEvent.set(match ?? null)
  })

  // Keep the URL in sync with the selection so it stays shareable/bookmarkable.
  $effect(() => {
    const ev = $selectedEvent
    const current = page.url.searchParams.get('event')
    if ((ev?.id ?? null) === current) return
    const url = new URL(page.url.href)
    if (ev) url.searchParams.set('event', ev.id)
    else url.searchParams.delete('event')
    goto(url, { replace: true, reset: false })
  })

  const STYLES = [
    { label: 'Physical', value: 'physical' },
    { label: 'Atlas', value: 'natgeo' },
    { label: 'Satellite', value: 'satellite' },
    { label: 'Modern', value: 'modern' },
  ] as const

  type StyleKey = (typeof STYLES)[number]['value']

  // Each story starts on its own default base-map style; re-adopted when switching stories,
  // overridden by the style switcher. Derived (not set in an $effect) so <Map> mounts once
  // with the right style instead of mounting with 'physical' and being immediately remounted.
  let activeStyle = $derived<StyleKey>(data.story.map.defaultStyle ?? 'physical')
  // Kept across style switches and story changes; flat by default.
  let globe = $state(false)

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
    <button
      class="style-btn globe-btn"
      class:active={globe}
      aria-pressed={globe}
      title={globe ? 'Switch to flat map' : 'Switch to 3D globe'}
      onclick={() => (globe = !globe)}
    >
      Globe
    </button>
  </header>

  <div class="content-area">
    {#if data.story.displayMode !== 'choropleth' || data.story.choropleth?.valueFormula === 'political'}
      <EventSidebar story={data.story} />
    {/if}

    <div class="map-area">
      {#key activeStyle}
        <Map story={data.story} styleOverride={resolvedStyle(activeStyle) as string} {globe} />
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
    /* Mobile browsers count the space behind their toolbars in vh, hiding the timeline */
    height: 100dvh;
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

  /* Hover rules are scoped to real pointers so they don't stick after a tap on touch screens */
  @media (hover: hover) {
    .back-link:hover {
      color: var(--brass);
    }
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

  @media (hover: hover) {
    .style-btn:hover {
      color: var(--fg);
      background: var(--raised);
    }
  }

  .style-btn.active {
    background: var(--raised);
    color: var(--fg);
    border-left: 2px solid var(--brass);
  }

  /* Same look as a style button, framed on its own since it's a toggle, not one of the styles */
  .globe-btn {
    flex-shrink: 0;
    border: 1px solid var(--border);
  }

  .content-area {
    position: relative;
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

  /* Phones: back link, title and globe on one row, the style switcher full width below */
  @media (max-width: 720px) {
    .story-header {
      flex-wrap: wrap;
      row-gap: 6px;
      padding: 6px 12px 8px;
    }
    .story-title {
      flex: 1;
      min-width: 0;
    }
    .story-desc {
      display: none;
    }
    .style-switcher {
      order: 1;
      width: 100%;
    }
    .style-switcher .style-btn {
      flex: 1;
    }
    .style-btn {
      min-height: 32px;
    }
  }
</style>
