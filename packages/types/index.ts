export interface Story {
  id: string
  title: string
  description: string
  map: {
    center: [number, number]
    zoom: number
    bearing?: number
    pitch?: number
    styleUrl?: string
  }
  timeRange: {
    start: string
    end: string
  }
  events: StoryEvent[]
}

export interface StoryEvent {
  id: string
  title: string
  description?: string
  timestamp: string
  location?: {
    type: 'point' | 'area' | 'route'
    coordinates: [number, number] | [number, number][]
    radius?: number
  }
  category?: string
  value?: number
  media?: { type: 'image' | 'video'; url: string }[]
}
