import type { Story } from '@fact-o-map/types'

export const BASE = 'http://localhost:3000'

export async function getStories(fetch = globalThis.fetch): Promise<Story[]> {
  const res = await fetch(`${BASE}/stories`)
  if (!res.ok) throw new Error(`Failed to fetch stories: ${res.status}`)
  return res.json()
}

export async function getStory(id: string, fetch = globalThis.fetch): Promise<Story> {
  const res = await fetch(`${BASE}/stories/${id}`)
  if (!res.ok) throw new Error(`Story not found: ${id}`)
  return res.json()
}
