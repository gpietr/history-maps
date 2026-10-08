import type { StoryEvent } from '@fact-o-map/types'

// Timestamps are ISO strings, BC years in expanded form with astronomical numbering
// ('-000752-04-21T00:00:00Z' = 21 Apr 753 BC, since year 0 = 1 BC). toLocaleDateString
// drops the era for those, so years are formatted by hand. Everything is read as UTC.

export function formatYear(iso: string): string {
  const y = new Date(iso).getUTCFullYear()
  if (y <= 0) return `${1 - y} BC`
  return y < 1000 ? `AD ${y}` : `${y}`
}

export function formatDate(iso: string, precision: StoryEvent['datePrecision'] = 'day'): string {
  if (precision === 'year') return formatYear(iso)
  const dayMonth = new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return `${dayMonth} ${formatYear(iso)}`
}

export function formatEventDate(ev: StoryEvent): string {
  return formatDate(ev.timestamp, ev.datePrecision)
}

const TWO_YEARS = 2 * 365.25 * 864e5

/**
 * Label for a [start, end) span: years for long spans, days for short ones. `end` is exclusive,
 * so the label shows the span's last moment — a period ending at 1 Jan 2011 reads "… – 2010".
 */
export function formatRange(start: string, end: string): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const last = new Date(e - 1).toISOString()
  if (e - s >= TWO_YEARS) return `${formatYear(start)} – ${formatYear(last)}`
  const first = formatDate(start)
  return first === formatDate(last) ? first : `${first} – ${formatDate(last)}`
}
