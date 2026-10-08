<script lang="ts">
  import type { Story, StoryEvent, StoryPeriod } from '@fact-o-map/types'
  import { selectedEvent } from './stores'
  import { colorFor } from './categories'
  import { formatDate, formatEventDate, formatRange } from './format'
  import { periodOf } from './periods'

  let { story }: { story: Story } = $props()

  const start = $derived(new Date(story.timeRange.start).getTime())
  const end = $derived(new Date(story.timeRange.end).getTime())
  const range = $derived(end - start)
  // Multi-decade stories label the track ends by year only.
  const rangePrecision = $derived(range > 10 * 365.25 * 864e5 ? 'year' as const : 'day' as const)

  function positionAt(iso: string) {
    return ((new Date(iso).getTime() - start) / range) * 100
  }

  function positionOf(event: StoryEvent) {
    return positionAt(event.timestamp)
  }

  let current = $derived($selectedEvent)
  const currentPeriod = $derived(current ? periodOf(current, story.periods) : undefined)

  function select(event: StoryEvent) {
    selectedEvent.set(event)
  }

  // Sorted events for display
  const sorted = $derived(
    [...story.events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  )

  // Clicking an era band jumps to its first event.
  function selectPeriod(period: StoryPeriod) {
    const first = sorted.find((ev) => periodOf(ev, [period]))
    if (first) select(first)
  }
</script>

<div class="timeline-container">
  <div class="timeline-header">
    <span class="timeline-date">{formatDate(story.timeRange.start, rangePrecision)}</span>
    <span class="timeline-title">{story.title}</span>
    <span class="timeline-date">{formatDate(story.timeRange.end, rangePrecision)}</span>
  </div>

  <div class="timeline-track">
    <div class="timeline-bar"></div>

    {#each sorted as event}
      {@const pos = positionOf(event)}
      {@const isSelected = current?.id === event.id}
      <button
        class="event-dot"
        class:selected={isSelected}
        style="left: {pos}%; background: {colorFor(event)}; border-color: {isSelected
          ? '#fff'
          : 'rgba(255,255,255,0.4)'}"
        title={event.title}
        onclick={() => select(event)}
      >
      </button>
    {/each}
  </div>

  {#if story.periods?.length}
    <div class="period-bands">
      {#each story.periods as period (period.id)}
        {@const left = Math.max(0, positionAt(period.start))}
        {@const right = Math.min(100, positionAt(period.end))}
        <button
          class="period-band"
          class:active={currentPeriod?.id === period.id}
          style="left: {left}%; width: {right - left}%"
          title="{period.title} ({formatRange(period.start, period.end)})"
          onclick={() => selectPeriod(period)}
        >
          <span>{period.title}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if current}
    <div class="event-info">
      <span class="event-date">{formatEventDate(current)}</span>
      <strong class="event-name">{current.title}</strong>
    </div>
  {:else}
    <div class="event-info muted">Click an event on the timeline or map</div>
  {/if}
</div>

<style>
  .timeline-container {
    padding: 10px 24px 14px;
    background: var(--surface);
    border-top: 1px solid var(--border-dim);
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .timeline-title {
    font-family: var(--font-display);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--fg-mid);
    letter-spacing: 0.04em;
  }

  .timeline-date {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--fg-dim);
    letter-spacing: 0.04em;
  }

  .timeline-track {
    position: relative;
    height: 32px;
    display: flex;
    align-items: center;
  }

  .timeline-bar {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border);
  }

  .event-dot {
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 2px solid rgba(228, 216, 188, 0.25);
    cursor: pointer;
    transform: translateX(-50%);
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    padding: 0;
    outline: none;
  }

  .event-dot:hover {
    transform: translateX(-50%) scale(1.4);
    box-shadow: 0 0 0 3px rgba(196, 152, 78, 0.2);
    border-color: var(--brass);
  }

  .event-dot.selected {
    transform: translateX(-50%) scale(1.5);
    border-color: rgba(228, 216, 188, 0.9);
    box-shadow: 0 0 0 3px rgba(196, 152, 78, 0.25);
  }

  .period-bands {
    position: relative;
    height: 18px;
    margin-top: -6px;
  }

  .period-band {
    position: absolute;
    top: 0;
    bottom: 0;
    padding: 0 5px;
    border: none;
    border-left: 1px solid var(--border);
    border-top: 2px solid var(--border-dim);
    background: transparent;
    cursor: pointer;
    overflow: hidden;
    text-align: left;
    transition: background 0.15s, border-color 0.15s;
  }

  .period-band span {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.56rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    line-height: 16px;
    color: var(--fg-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .period-band:hover {
    background: var(--raised);
  }
  .period-band:hover span {
    color: var(--fg-mid);
  }

  .period-band.active {
    background: var(--brass-dim);
    border-top-color: var(--brass);
  }
  .period-band.active span {
    color: var(--brass);
  }

  .event-info {
    font-size: 0.8rem;
    color: var(--fg);
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 18px;
  }

  .event-info.muted {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--fg-dim);
    font-style: italic;
    letter-spacing: 0.04em;
  }

  .event-date {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--brass);
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  .event-name {
    font-family: var(--font-display);
    font-weight: 500;
    letter-spacing: 0.01em;
  }
</style>
