<script lang="ts">
  import { onMount } from 'svelte'
  import type { Story, StoryEvent } from '@fact-o-map/types'
  import { selectedEvent } from './stores'
  import { colorFor } from './categories'
  import { formatEventDate, formatRange } from './format'
  import { groupByPeriod, sortByTime } from './periods'

  let { story }: { story: Story } = $props()

  let open = $state(false)
  let tileRefs: Record<string, HTMLButtonElement> = $state({})

  onMount(() => {
    open = window.innerWidth >= 1024
  })

  // Must match the overlay breakpoint in the styles below.
  const isOverlay = () => window.matchMedia('(max-width: 720px)').matches

  function pick(ev: StoryEvent) {
    selectedEvent.set(ev)
    // As an overlay the list covers the map; get out of the way so the fly-to is visible.
    if (isOverlay()) open = false
  }

  const sorted = $derived(sortByTime(story.events))
  const groups = $derived(groupByPeriod(sorted, story.periods))

  // Scroll selected tile into view when it changes.
  $effect(() => {
    const ev = $selectedEvent
    const tile = ev && open ? tileRefs[ev.id] : undefined
    if (!tile) return
    // Keep the tile clear of its sticky period header, whose height depends on the description.
    const header = tile.closest('section')?.querySelector<HTMLElement>('.period')
    tile.style.scrollMarginTop = `${header?.offsetHeight ?? 0}px`
    tile.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
</script>

<aside class="sidebar" class:open>
  <!-- Always-visible rail with the toggle -->
  <div class="rail">
    <button
      class="toggle"
      onclick={() => (open = !open)}
      title={open ? 'Hide events' : 'Show events'}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if open}
          <polyline points="10,3 5,8 10,13" />
        {:else}
          <polyline points="6,3 11,8 6,13" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Collapsible content -->
  <div class="content">
    <div class="list">
      {#each groups as group (group.events[0].id)}
        <section>
          {#if group.period}
            <header class="period">
              <div class="period-head">
                <h2 class="period-title">{group.period.title}</h2>
                <span class="period-range">{formatRange(group.period.start, group.period.end)}</span>
              </div>
              {#if group.period.description}
                <p class="period-desc">{group.period.description}</p>
              {/if}
            </header>
          {/if}
          {#each group.events as ev}
            {@const color = colorFor(ev)}
            {@const active = $selectedEvent?.id === ev.id}
            <button
              bind:this={tileRefs[ev.id]}
              class="tile"
              class:active
              onclick={() => pick(ev)}
            >
              <div class="accent" style="background:{color};opacity:{active ? 1 : 0.55}"></div>
              <div class="body">
                <time class="date">{formatEventDate(ev)}</time>
                <div class="title">{ev.title}</div>
                {#if ev.description}
                  <p class="desc">{ev.description}</p>
                {/if}
                {#if ev.category}
                  <span class="cat" style="color:{color}">{ev.category}</span>
                {/if}
              </div>
            </button>
          {/each}
        </section>
      {/each}
    </div>
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 36px;
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border-dim);
    overflow: hidden;
    transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.open {
    width: 300px;
  }

  /* Rail — always visible 36px strip */
  .rail {
    width: 36px;
    min-width: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    gap: 8px;
    border-right: 1px solid var(--border-dim);
    flex-shrink: 0;
  }

  .toggle {
    width: 26px;
    height: 26px;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--raised);
    color: var(--fg-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.15s, color 0.15s;
  }
  @media (hover: hover) {
    .toggle:hover {
      background: var(--hover);
      color: var(--fg);
    }
    .tile:hover { background: var(--raised); }
    .tile:hover .title { color: var(--fg); }
  }
  .toggle svg {
    width: 13px;
    height: 13px;
  }

  /* Scrollable event list */
  .content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-width: 0;
    opacity: 0;
    transition: opacity 0.15s ease 0.08s;
  }

  .sidebar.open .content {
    opacity: 1;
  }

  .content::-webkit-scrollbar { width: 3px; }
  .content::-webkit-scrollbar-track { background: transparent; }
  .content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 0; }

  .list {
    padding: 6px 0 24px;
  }

  /* Period header — sticks to the top while its events scroll beneath it */
  .period {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 12px 12px 9px 13px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    border-top: 1px solid var(--border-dim);
  }
  .period-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .period-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--brass);
    letter-spacing: 0.02em;
    line-height: 1.2;
  }
  .period-range {
    font-family: var(--font-mono);
    font-size: 0.56rem;
    color: var(--fg-dim);
    letter-spacing: 0.06em;
    white-space: nowrap;
    text-transform: uppercase;
  }
  .period-desc {
    margin: 4px 0 0;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-style: italic;
    color: var(--fg-mid);
    line-height: 1.45;
  }

  /* Event tile */
  .tile {
    display: flex;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-dim);
    cursor: pointer;
    padding: 0;
    transition: background 0.12s;
  }
  .tile.active  { background: var(--raised); }

  .accent {
    width: 3px;
    min-width: 3px;
    align-self: stretch;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }

  .body {
    padding: 10px 12px 10px 10px;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .date {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--fg-dim);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .tile.active .date { color: var(--brass); }

  .title {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--fg-mid);
    line-height: 1.3;
  }
  .tile.active .title { color: var(--fg); }

  .desc {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: var(--fg-dim);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tile.active .desc {
    color: var(--fg-mid);
    -webkit-line-clamp: unset;
    line-clamp: unset;
    overflow: visible;
  }

  .cat {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    opacity: 0.7;
  }
  .tile.active .cat { opacity: 1; }

  /* Phones: the rail stays in the layout, the open list floats over the map instead of squeezing it */
  @media (max-width: 720px) {
    .sidebar,
    .sidebar.open {
      position: relative;
      z-index: 5;
      width: 36px;
      overflow: visible;
    }
    .toggle {
      width: 30px;
      height: 30px;
    }
    .content {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 36px;
      width: min(300px, calc(100vw - 72px));
      background: var(--surface);
      border-right: 1px solid var(--border);
      box-shadow: 8px 0 24px rgba(0, 0, 0, 0.5);
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0s linear 0.15s;
    }
    .sidebar.open .content {
      visibility: visible;
      transition: opacity 0.15s ease;
    }
  }
</style>
