export interface ChoroplethConfig {
  /** Backend path to augmented GeoJSON (features include base, area, lat, lng in properties) */
  geoJsonUrl: string
  /** Diverging colour stops: [value, hex] pairs for an interpolate-linear scale */
  colorStops: Array<[number, string]>
  /**
   * How to derive the per-feature display value from the selected event's `.value`.
   * 'direct'       — same value for every feature (uniform colour shift)
   * 'localAnomaly' — value × polar-amplification(lat), amp = 1 + 2×|lat|/90
   * 'political'    — categorical: each feature property [eraKey] → polity name → colour
   */
  valueFormula: 'direct' | 'localAnomaly' | 'political'
  /** Unit appended to label text, e.g. '°C' */
  unit?: string
  /** Polity name → hex colour, used in 'political' mode */
  polities?: Record<string, string>
  /** 'political' mode: colour for polities not in `polities` (default: a distinct hashed colour each) */
  othersColor?: string
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
    /** Which base-map style the switcher should start on for this story */
    defaultStyle?: 'physical' | 'natgeo' | 'satellite' | 'modern'
  }
  timeRange: {
    start: string
    end: string
  }
  /** Named eras that group events in the sidebar and band the timeline */
  periods?: StoryPeriod[]
  events: StoryEvent[]
}

export interface StoryPeriod {
  id: string
  title: string
  description?: string
  /** Inclusive */
  start: string
  /** Exclusive — an event exactly at `end` belongs to the next period */
  end: string
}

export interface StoryEvent {
  id: string
  title: string
  description?: string
  timestamp: string
  /** How precisely `timestamp` is known; 'year' hides day and month. Default 'day'. */
  datePrecision?: 'day' | 'year'
  location?: {
    type: 'point' | 'area' | 'route'
    coordinates: [number, number] | [number, number][]
    radius?: number
    /** Zoom level to fly to when the event is selected */
    zoom?: number
  }
  category?: string
  value?: number
  /** For 'political' choropleth: which GeoJSON feature property to read (e.g. 'era_1914') */
  eraKey?: string
  media?: { type: 'image' | 'video'; url: string }[]
}
