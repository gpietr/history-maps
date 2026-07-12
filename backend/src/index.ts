import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { stories } from './data/stories'
import { getAugmentedWorldGeoJson, getHistoricalGeoJson } from './geojson'

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
  .listen(3000)

console.log('Fact-o-Map backend running at http://localhost:3000')

export type App = typeof app
