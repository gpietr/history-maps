import { writable } from 'svelte/store'
import type { StoryEvent } from '@fact-o-map/types'

export const selectedEvent = writable<StoryEvent | null>(null)
