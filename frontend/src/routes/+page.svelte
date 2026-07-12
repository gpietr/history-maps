<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  function formatDateRange(start: string, end: string) {
    const s = new Date(start).getFullYear()
    const e = new Date(end).getFullYear()
    return s === e ? `${s}` : `${s} – ${e}`
  }
</script>

<div class="index">
  <header class="site-header">
    <div class="header-inner">
      <span class="logo-mark">◈</span>
      <div class="logo-text">
        <span class="logo-name">Fact-o-Map</span>
        <span class="logo-sub">Historical Atlas</span>
      </div>
    </div>
  </header>

  <main class="main">
    <div class="section-head">
      <span class="section-label">Archive</span>
      <h2 class="section-title">Stories</h2>
    </div>

    <div class="story-grid">
      {#each data.stories as story}
        <a href="/story/{story.id}" class="story-card">
          <div class="card-meta">
            <time class="card-year">{formatDateRange(story.timeRange.start, story.timeRange.end)}</time>
            <span class="card-count">{story.events.length} entries</span>
          </div>
          <h3 class="card-title">{story.title}</h3>
          <p class="card-desc">{story.description}</p>
          <span class="card-cta">Open record →</span>
        </a>
      {/each}
    </div>
  </main>
</div>

<style>
  .index {
    min-height: 100vh;
    background: var(--bg);
  }

  .site-header {
    border-bottom: 1px solid var(--border-dim);
    padding: 0 2rem;
  }

  .header-inner {
    max-width: 56rem;
    margin: 0 auto;
    padding: 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-mark {
    font-family: var(--font-display);
    font-size: 1.6rem;
    color: var(--brass);
    line-height: 1;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .logo-name {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--fg);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: 1.1;
  }

  .logo-sub {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    color: var(--fg-dim);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .main {
    max-width: 56rem;
    margin: 0 auto;
    padding: 3rem 2rem 4rem;
  }

  .section-head {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-dim);
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--brass);
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 400;
    color: var(--fg);
    margin: 0;
    letter-spacing: 0.02em;
    line-height: 1;
  }

  .story-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
  }

  .story-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    background: var(--surface);
    text-decoration: none;
    color: inherit;
    border-left: 3px solid transparent;
    transition: background 0.15s, border-color 0.15s;
  }

  .story-card:hover {
    background: var(--raised);
    border-left-color: var(--brass);
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.15rem;
  }

  .card-year {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--brass);
    letter-spacing: 0.04em;
  }

  .card-count {
    font-family: var(--font-mono);
    font-size: 0.63rem;
    color: var(--fg-dim);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .card-title {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--fg);
    margin: 0;
    line-height: 1.25;
    letter-spacing: 0.01em;
    transition: color 0.15s;
  }

  .story-card:hover .card-title {
    color: #f0e8d4;
  }

  .card-desc {
    font-family: var(--font-body);
    font-size: 0.85rem;
    color: var(--fg-mid);
    line-height: 1.55;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-cta {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--brass);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .story-card:hover .card-cta {
    opacity: 1;
  }
</style>
