import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { stories } from './data/stories'
import { getAugmentedWorldGeoJson, getHistoricalGeoJson } from './geojson'
import { getCliopatriaYear, MAX_YEAR, MIN_YEAR } from './cliopatria'

// Every year a Cliopatria-based story shows — extracted together on the first request.
const CLIO_URL = '/geojson/clio'
const clioYears = stories
  .filter((s) => s.choropleth?.geoJsonUrl === CLIO_URL)
  .flatMap((s) => s.events.map((e) => Number(e.eraKey)))
  .filter(Number.isInteger)

// `||` (not `??`) so an empty or non-numeric PORT also falls back instead of binding port 0/NaN.
const port = Number(process.env.PORT) || 3000

const app = new Elysia()
  .use(cors())
  .get('/stories', () => stories)
  .get('/stories/:id', ({ params: { id }, status }) => {
    const story = stories.find((s) => s.id === id)
    if (!story) return status(404, { message: 'Story not found' })
    return story
  })
  .get('/geojson/world-countries', () => getAugmentedWorldGeoJson())
  .get('/geojson/political/:year', async ({ params: { year }, status }) => {
    const geoJson = await getHistoricalGeoJson(year)
    if (!geoJson) return status(404, { message: `No historical GeoJSON for year ${year}` })
    return geoJson
  })
  .get(`${CLIO_URL}/:year`, ({ params: { year }, status }) => {
    const y = Number(year)
    if (!/^-?\d+$/.test(year) || y < MIN_YEAR || y > MAX_YEAR) {
      return status(404, { message: `Cliopatria covers ${MIN_YEAR} to ${MAX_YEAR}` })
    }
    return getCliopatriaYear(y, clioYears)
  })
  .listen(port)

console.log(`Fact-o-Map backend running at http://localhost:${port}`)

export type App = typeof app
