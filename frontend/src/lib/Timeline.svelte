<script lang="ts">
  import type { Story, StoryEvent } from '@chronomap/types'
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

  const start = new Date(story.timeRange.start).getTime()
  const end = new Date(story.timeRange.end).getTime()
  const range = end - start

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
  const sorted = [...story.events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
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
    padding: 12px 24px 16px;
    background: #161b22;
    border-top: 1px solid #30363d;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #8b949e;
  }

  .timeline-title {
    font-size: 12px;
    font-weight: 600;
    color: #e6edf3;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .timeline-date {
    font-variant-numeric: tabular-nums;
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
    height: 2px;
    background: #30363d;
    border-radius: 1px;
  }

  .event-dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transform: translateX(-50%);
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    padding: 0;
    outline: none;
  }

  .event-dot:hover {
    transform: translateX(-50%) scale(1.4);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
  }

  .event-dot.selected {
    transform: translateX(-50%) scale(1.5);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
  }

  .event-info {
    font-size: 13px;
    color: #e6edf3;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 20px;
  }

  .event-info.muted {
    color: #484f58;
    font-style: italic;
  }

  .event-date {
    color: #8b949e;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .event-name {
    font-weight: 600;
  }
</style>
