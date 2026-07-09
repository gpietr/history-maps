import type { Story } from '@chronomap/types'

const BASE = 'http://localhost:3000'

export async function getStories(): Promise<Story[]> {
  const res = await fetch(`${BASE}/stories`)
  if (!res.ok) throw new Error(`Failed to fetch stories: ${res.status}`)
  return res.json()
}

export async function getStory(id: string): Promise<Story> {
  const res = await fetch(`${BASE}/stories/${id}`)
  if (!res.ok) throw new Error(`Story not found: ${id}`)
  return res.json()
}
