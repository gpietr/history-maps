import type { StoryEvent, StoryPeriod } from '@fact-o-map/types'

export function periodOf(event: StoryEvent, periods: StoryPeriod[] = []): StoryPeriod | undefined {
  const t = new Date(event.timestamp).getTime()
  return periods.find((p) => t >= new Date(p.start).getTime() && t < new Date(p.end).getTime())
}

/**
 * Splits time-sorted events into consecutive runs sharing a period. Events outside every
 * period form runs with `period: undefined`, so stories without periods yield one plain group.
 */
export function groupByPeriod(sorted: StoryEvent[], periods: StoryPeriod[] = []) {
  const groups: { period?: StoryPeriod; events: StoryEvent[] }[] = []
  for (const ev of sorted) {
    const period = periodOf(ev, periods)
    const last = groups.at(-1)
    if (last && last.period === period) last.events.push(ev)
    else groups.push({ period, events: [ev] })
  }
  return groups
}
