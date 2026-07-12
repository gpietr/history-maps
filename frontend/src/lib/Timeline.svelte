<script lang="ts">
  import type { Story, StoryEvent } from '@fact-o-map/types'
  import { selectedEvent } from './stores'

  let { story }: { story: Story } = $props()

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

  const start = $derived(new Date(story.timeRange.start).getTime())
  const end = $derived(new Date(story.timeRange.end).getTime())
  const range = $derived(end - start)

  function positionOf(event: StoryEvent) {
    const t = new Date(event.timestamp).getTime()
    return ((t - start) / range) * 100
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  let current = $derived($selectedEvent)

  function select(event: StoryEvent) {
    selectedEvent.set(event)
  }

  // Sorted events for display
  const sorted = $derived(
    [...story.events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  )
</script>

<div class="timeline-container">
  <div class="timeline-header">
    <span class="timeline-date">{formatDate(story.timeRange.start)}</span>
    <span class="timeline-title">{story.title}</span>
    <span class="timeline-date">{formatDate(story.timeRange.end)}</span>
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

  {#if current}
    <div class="event-info">
      <span class="event-date">{formatDate(current.timestamp)}</span>
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
