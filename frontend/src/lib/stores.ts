import { writable } from 'svelte/store'
import type { StoryEvent } from '@chronomap/types'

export const selectedEvent = writable<StoryEvent | null>(null)
