// Measured 1951–1980 mean annual temperature (°C) for major countries.
// Land masses run warmer than the global ocean-weighted lat→temp curve.
const COUNTRY_BASELINE: Record<string, number> = {
  Russia: -5.5, Canada: -4.5, 'United States of America': 8.5,
  Brazil: 25.5, Australia: 21.5, China: 7.5, India: 25.0,
  Argentina: 14.0, Kazakhstan: 3.5, Algeria: 22.5,
  'Dem. Rep. Congo': 24.5, 'Saudi Arabia': 26.5, Mexico: 21.0,
  Indonesia: 26.5, Sudan: 28.0, Libya: 22.5, Iran: 17.5,
  Mongolia: -0.5, Peru: 18.0, Chad: 28.0, Niger: 29.0,
  Angola: 22.0, Mali: 29.0, 'South Africa': 17.5, Colombia: 24.0,
  Ethiopia: 22.5, Bolivia: 15.5, Mauritania: 28.5, Egypt: 22.0,
  Tanzania: 22.5, Nigeria: 27.0, Venezuela: 26.0, Pakistan: 20.0,
  Mozambique: 22.5, Turkey: 12.5, Chile: 8.5, Zambia: 21.5,
  Myanmar: 23.5, Afghanistan: 12.5, Somalia: 27.5, Ukraine: 7.5,
  Germany: 8.5, France: 11.5, Spain: 14.0, Poland: 8.0,
  'United Kingdom': 9.0, Italy: 13.5, Romania: 9.5, Hungary: 10.5,
  Belarus: 6.0, 'Czech Republic': 8.5, Serbia: 11.0, Bulgaria: 10.5,
  Sweden: 2.5, Norway: 1.5, Finland: 1.0, Japan: 11.5,
  'South Korea': 11.0, 'North Korea': 5.5,
}

function latBaseline(absLat: number): number {
  const table: [number, number][] = [
    [0, 27], [10, 26], [20, 22], [30, 17],
    [40, 12], [50, 7], [60, 1], [70, -10], [80, -22], [90, -35],
  ]
  for (let i = 1; i < table.length; i++) {
    if (absLat <= table[i][0]) {
      const t = (absLat - table[i - 1][0]) / (table[i][0] - table[i - 1][0])
      return table[i - 1][1] + t * (table[i][1] - table[i - 1][1])
    }
  }
  return -35
}

function baselineTemp(absLat: number, name?: string): number {
  if (name && COUNTRY_BASELINE[name] !== undefined) return COUNTRY_BASELINE[name]
  return latBaseline(absLat)
}

function ringArea(ring: number[][]): number {
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
  }
  return Math.abs(a / 2)
}

type RawFeature = {
  geometry: { type: string; coordinates: unknown }
  properties: Record<string, unknown>
}

function featureArea(f: RawFeature): number {
  const g = f.geometry
  if (g.type === 'Polygon') return ringArea((g.coordinates as number[][][])[0])
  if (g.type === 'MultiPolygon')
    return (g.coordinates as number[][][][]).reduce((s, p) => s + ringArea(p[0]), 0)
  return 0
}

// Centroid of the largest polygon ring — prevents multiple labels on island nations.
function largestRingCentroid(f: RawFeature): [number, number] {
  const g = f.geometry
  const rings: number[][][] =
    g.type === 'Polygon'
      ? [(g.coordinates as number[][][])[0]]
      : (g.coordinates as number[][][][]).map((p) => p[0])
  let best = rings[0], bestA = 0
  for (const r of rings) { const a = ringArea(r); if (a > bestA) { bestA = a; best = r } }
  const cx = best.reduce((s, c) => s + c[0], 0) / best.length
  const cy = best.reduce((s, c) => s + c[1], 0) / best.length
  return [cx, cy]
}

// Cached so we only fetch + compute once per server process.
let cached: object | null = null

export async function getAugmentedWorldGeoJson(): Promise<object> {
  if (cached) return cached

  const raw = await fetch(
    'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
  )
  const geoJson = await raw.json() as { features: RawFeature[] }

  geoJson.features = geoJson.features.map((f) => {
    const name = f.properties.name as string | undefined
    const [lng, lat] = largestRingCentroid(f)
    const base = baselineTemp(Math.abs(lat), name)
    const area = featureArea(f)
    return { ...f, properties: { ...f.properties, base, area, lat, lng } }
  })

  cached = geoJson
  return geoJson
}

const VALID_YEARS = new Set([
  '100','200','300','400','500','600','700','800','900','1000','1100','1200','1279','1300','1400',
  '1492','1500','1530','1600','1650','1700','1715',
  '1783','1800','1815','1880','1900','1914','1920','1930','1938','1945','1960','1994','2010',
])
const historicalCache = new Map<string, object>()

export async function getHistoricalGeoJson(year: string): Promise<object | null> {
  if (!VALID_YEARS.has(year)) return null
  if (historicalCache.has(year)) return historicalCache.get(year)!

  const url = `https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${year}.geojson`
  const raw = await fetch(url)
  const geoJson = await raw.json() as object
  historicalCache.set(year, geoJson)
  return geoJson
}
