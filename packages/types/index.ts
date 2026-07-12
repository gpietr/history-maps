export interface ChoroplethConfig {
  /** Backend path to augmented GeoJSON (features include base, area, lat, lng in properties) */
  geoJsonUrl: string
  /** Diverging colour stops: [value, hex] pairs for an interpolate-linear scale */
  colorStops: Array<[number, string]>
  /**
   * How to derive the per-feature display value from the selected event's `.value`.
   * 'direct'       — same value for every feature (uniform colour shift)
   * 'localAnomaly' — value × polar-amplification(lat), amp = 1 + 2×|lat|/90
   */
  valueFormula: 'direct' | 'localAnomaly'
  /** Unit appended to label text, e.g. '°C' */
  unit?: string
}

export interface Story {
  id: string
  title: string
  description: string
  displayMode?: 'events' | 'choropleth'
  choropleth?: ChoroplethConfig
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
