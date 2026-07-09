<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  function formatDateRange(start: string, end: string) {
    const s = new Date(start).getFullYear()
    const e = new Date(end).getFullYear()
    return s === e ? `${s}` : `${s} – ${e}`
  }
</script>

<div class="min-h-screen bg-[#0d1117]">
  <header class="border-b border-[#30363d] px-8 py-5">
    <div class="max-w-5xl mx-auto flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <svg viewBox="0 0 24 24" class="w-4 h-4 text-white fill-current">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <h1 class="text-lg font-semibold text-[#e6edf3] tracking-tight">ChronoMap</h1>
      <span class="text-[#484f58] text-sm ml-1">Stories on maps</span>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-8 py-12">
    <h2 class="text-2xl font-bold text-[#e6edf3] mb-2">Stories</h2>
    <p class="text-[#8b949e] mb-8">Explore historical events and narratives placed in time and space.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each data.stories as story}
        <a
          href="/story/{story.id}"
          class="group block bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#58a6ff] hover:bg-[#1c2128] transition-all duration-200"
        >
          <div class="flex items-start justify-between mb-3">
            <span class="text-xs font-medium px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded-full text-[#8b949e]">
              {formatDateRange(story.timeRange.start, story.timeRange.end)}
            </span>
            <span class="text-[#8b949e] text-xs">{story.events.length} events</span>
          </div>
          <h3 class="text-[#e6edf3] font-semibold text-lg mb-2 group-hover:text-[#58a6ff] transition-colors">
            {story.title}
          </h3>
          <p class="text-[#8b949e] text-sm leading-relaxed line-clamp-3">
            {story.description}
          </p>
          <div class="mt-4 flex items-center gap-1 text-[#58a6ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Explore story →
          </div>
        </a>
      {/each}
    </div>
  </main>
</div>
