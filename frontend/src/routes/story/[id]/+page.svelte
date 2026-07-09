<script lang="ts">
  import type { PageData } from './$types'
  import Map from '$lib/Map.svelte'
  import Timeline from '$lib/Timeline.svelte'

  let { data }: { data: PageData } = $props()

  const STYLES = [
    { label: 'Physical', value: 'physical' },
    { label: 'Atlas', value: 'natgeo' },
    { label: 'Satellite', value: 'satellite' },
    { label: 'Modern', value: 'modern' },
  ] as const

  type StyleKey = (typeof STYLES)[number]['value']

  let activeStyle = $state<StyleKey>('physical')

  function esriStyle(serviceUrl: string, attribution: string) {
    return {
      version: 8 as const,
      sources: {
        esri: {
          type: 'raster' as const,
          tiles: [serviceUrl],
          tileSize: 256,
          attribution,
          maxzoom: 19,
        },
      },
      layers: [{ id: 'esri-base', type: 'raster' as const, source: 'esri' }],
    }
  }

  const STYLE_MAP = {
    // Pure physical geography — no city names, no roads, no political borders
    physical: esriStyle(
      'https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
      'Tiles © Esri, DeLorme, NAVTEQ'
    ),
    // Classic National Geographic atlas style — muted colors, minimal labels
    natgeo: esriStyle(
      'https://services.arcgisonline.com/arcgis/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      'Tiles © Esri, National Geographic'
    ),
    // True-color satellite imagery — terrain is timeless even if roads aren't
    satellite: esriStyle(
      'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      'Tiles © Esri, Maxar, Earthstar Geographics'
    ),
    // Modern street map — useful for orientation
    modern: 'https://tiles.openfreemap.org/styles/liberty',
  }

  function resolvedStyle(key: StyleKey): string | object {
    return STYLE_MAP[key]
  }
</script>

<div class="story-layout">
  <header class="story-header">
    <a href="/" class="back-link">← Stories</a>
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

  <div class="map-area">
    {#key activeStyle}
      <Map story={data.story} styleOverride={resolvedStyle(activeStyle) as string} />
    {/key}
  </div>

  <div class="timeline-area">
    <Timeline story={data.story} />
  </div>
</div>

<style>
  .story-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #0d1117;
  }

  .story-header {
    padding: 8px 16px;
    border-bottom: 1px solid #30363d;
    background: #161b22;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .back-link {
    color: #8b949e;
    text-decoration: none;
    font-size: 13px;
    white-space: nowrap;
    transition: color 0.15s;
  }

  .back-link:hover {
    color: #58a6ff;
  }

  .story-title {
    font-size: 14px;
    font-weight: 600;
    color: #e6edf3;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .story-desc {
    font-size: 12px;
    color: #8b949e;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .style-switcher {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    background: #0d1117;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid #30363d;
  }

  .style-btn {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: transparent;
    color: #8b949e;
    transition: background 0.15s, color 0.15s;
  }

  .style-btn:hover {
    color: #e6edf3;
    background: #21262d;
  }

  .style-btn.active {
    background: #21262d;
    color: #e6edf3;
  }

  .map-area {
    flex: 1;
    min-height: 0;
  }

  .timeline-area {
    flex-shrink: 0;
  }
</style>
