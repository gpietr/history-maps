<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { Story, StoryEvent } from '@fact-o-map/types'
  import { selectedEvent } from './stores'

  let { story }: { story: Story } = $props()

  // 1951-1980 global mean surface temperature baseline (NASA GISTEMP)
  const BASELINE = 14.0

  // SVG coordinate system
  const W = 1000
  const H = 110
  const PAD = { top: 10, right: 10, bottom: 22, left: 40 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  // All story-derived computations in one reactive block to avoid cascading $derived warnings
  const computed = $derived.by(() => {
    const sorted = [...story.events]
      .filter((e) => e.value !== undefined)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const absValues = sorted.map((e) => BASELINE + e.value!)
    const minVal = Math.min(...absValues)
    const maxVal = Math.max(...absValues)
    const startMs = new Date(story.timeRange.start).getTime()
    const endMs = new Date(story.timeRange.end).getTime()
    const valueRange = maxVal - minVal
    const zeroY = PAD.top + ((maxVal - BASELINE) / valueRange) * plotH

    function xOf(e: StoryEvent) {
      return PAD.left + ((new Date(e.timestamp).getTime() - startMs) / (endMs - startMs)) * plotW
    }
    function yOf(v: number) {
      return PAD.top + ((maxVal - v) / valueRange) * plotH
    }

    const pts = sorted.map((e) => ({ x: xOf(e), y: yOf(BASELINE + e.value!), event: e }))

    const linePath = 'M ' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')

    const areaPath =
      `M ${pts[0].x.toFixed(1)},${zeroY.toFixed(1)} ` +
      'L ' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ') +
      ` L ${pts[pts.length - 1].x.toFixed(1)},${zeroY.toFixed(1)} Z`

    const decades = sorted.filter((e) => new Date(e.timestamp).getFullYear() % 20 === 0)
    const yTicks = [13.5, 14.0, 14.5, 15.0].filter((v) => v > minVal - 0.1 && v < maxVal + 0.1)

    return { sorted, minVal, maxVal, startMs, endMs, valueRange, zeroY, pts, linePath, areaPath, decades, yTicks, xOf, yOf }
  })

  // Playback
  let playing = $state(false)
  let selectedIdx = $state(0)
  let interval: ReturnType<typeof setInterval> | null = null

  function selectIdx(i: number) {
    selectedIdx = i
    selectedEvent.set(computed.sorted[i])
  }

  function togglePlay() {
    if (playing) {
      stop()
    } else {
      if (selectedIdx >= computed.sorted.length - 1) selectIdx(0)
      playing = true
      interval = setInterval(() => {
        if (selectedIdx < computed.sorted.length - 1) {
          selectIdx(selectedIdx + 1)
        } else {
          stop()
        }
      }, 100)
    }
  }

  function stop() {
    playing = false
    if (interval) { clearInterval(interval); interval = null }
  }

  // Sync selectedIdx when external code (e.g. map click) changes the store
  $effect(() => {
    const ev = $selectedEvent
    if (!ev) return
    const i = computed.sorted.findIndex((e) => e.id === ev.id)
    if (i !== -1 && i !== selectedIdx) selectedIdx = i
  })

  onMount(() => selectIdx(0))
  onDestroy(() => stop())

  let svgEl: SVGSVGElement

  function onMouseMove(e: MouseEvent) {
    const rect = svgEl.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    let best = 0, bestDist = Infinity
    for (let i = 0; i < computed.pts.length; i++) {
      const d = Math.abs(computed.pts[i].x - mx)
      if (d < bestDist) { bestDist = d; best = i }
    }
    selectIdx(best)
  }

  let current = $derived($selectedEvent)

  function fmt(anomaly: number) { return (BASELINE + anomaly).toFixed(2) + '°C' }
</script>

<div class="chart-wrap">
  <div class="chart-header">
    <button class="play-btn" onclick={togglePlay} title={playing ? 'Pause' : 'Play through time'}>
      {#if playing}
        <svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>
      {:else}
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 2.5l10 5.5-10 5.5V2.5z"/></svg>
      {/if}
    </button>

    {#if current && current.value !== undefined}
      <span class="year">{new Date(current.timestamp).getFullYear()}</span>
      <span class="anomaly" class:warm={current.value >= 0} class:cool={current.value < 0}>
        {fmt(current.value)}
      </span>
      <span class="label">global mean surface temp</span>
    {/if}
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    viewBox="0 0 {W} {H}"
    preserveAspectRatio="none"
    bind:this={svgEl}
    onmousemove={onMouseMove}
    class="chart-svg"
  >
    <defs>
      <clipPath id="clip-warm">
        <rect x={PAD.left} y={PAD.top} width={plotW} height={Math.max(0, computed.zeroY - PAD.top)} />
      </clipPath>
      <clipPath id="clip-cool">
        <rect x={PAD.left} y={computed.zeroY} width={plotW} height={Math.max(0, H - PAD.bottom - computed.zeroY)} />
      </clipPath>
    </defs>

    <!-- Warm fill (above zero) -->
    <path d={computed.areaPath} fill="#d6604d" opacity="0.45" clip-path="url(#clip-warm)" />
    <!-- Cool fill (below zero) -->
    <path d={computed.areaPath} fill="#4393c3" opacity="0.45" clip-path="url(#clip-cool)" />

    <!-- Zero line -->
    <line
      x1={PAD.left} y1={computed.zeroY}
      x2={W - PAD.right} y2={computed.zeroY}
      stroke="#5e5244" stroke-width="0.6" stroke-dasharray="3,3"
    />

    <!-- Data line -->
    <path d={computed.linePath} fill="none" stroke="#c4b89a" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Selected vertical rule -->
    <line
      x1={computed.pts[selectedIdx].x} y1={PAD.top}
      x2={computed.pts[selectedIdx].x} y2={H - PAD.bottom}
      stroke="white" stroke-width="1" opacity="0.4"
    />
    <!-- Selected dot -->
    <circle
      cx={computed.pts[selectedIdx].x} cy={computed.pts[selectedIdx].y} r="4"
      fill={current && current.value !== undefined && current.value >= 0 ? '#f87171' : '#60a5fa'}
      stroke="white" stroke-width="1.5"
    />

    <!-- X axis decade ticks -->
    {#each computed.decades as e}
      <text
        x={computed.xOf(e)} y={H - PAD.bottom + 12}
        text-anchor="middle" font-size="8" fill="#5e5244" font-family="IBM Plex Mono, monospace"
      >{new Date(e.timestamp).getFullYear()}</text>
    {/each}

    <!-- Y axis ticks -->
    {#each computed.yTicks as v}
      <text
        x={PAD.left - 3} y={computed.yOf(v) + 3}
        text-anchor="end" font-size="7" fill="#5e5244" font-family="IBM Plex Mono, monospace"
      >{v >= 0 ? '+' : ''}{v.toFixed(1)}</text>
      <line
        x1={PAD.left - 1} y1={computed.yOf(v)}
        x2={PAD.left + 2} y2={computed.yOf(v)}
        stroke="#5e5244" stroke-width="0.5"
      />
    {/each}
  </svg>
</div>

<style>
  .chart-wrap {
    background: var(--surface);
    border-top: 1px solid var(--border-dim);
    padding: 8px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .chart-header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 24px;
  }

  .play-btn {
    width: 24px;
    height: 24px;
    border-radius: 0;
    border: 1px solid var(--border);
    background: var(--raised);
    color: var(--fg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    flex-shrink: 0;
    transition: background 0.15s;
  }
  .play-btn:hover { background: var(--hover); }
  .play-btn svg { width: 11px; height: 11px; }

  .year {
    font-family: var(--font-mono);
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--fg);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    min-width: 48px;
    letter-spacing: 0.02em;
  }

  .anomaly {
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    min-width: 64px;
    letter-spacing: 0.02em;
  }
  .anomaly.warm { color: #f87171; }
  .anomaly.cool { color: #60a5fa; }

  .label {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    color: var(--fg-dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .chart-svg {
    width: 100%;
    height: 110px;
    cursor: crosshair;
    display: block;
  }
</style>
