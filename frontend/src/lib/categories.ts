import type { StoryEvent } from '@fact-o-map/types'

export const CATEGORY_COLORS: Record<string, string> = {
  landing: '#3b82f6', battle: '#ef4444', victory: '#22c55e',
  military: '#a855f7', life: '#f59e0b', education: '#06b6d4', achievement: '#f97316',
  politics: '#d4a24c', war: '#ef4444', religion: '#facc15', culture: '#06b6d4', disaster: '#fb923c',
}

export function colorFor(event: StoryEvent): string {
  return CATEGORY_COLORS[event.category ?? ''] ?? '#6b7280'
}
