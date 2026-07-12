import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { stories } from './data/stories'
import { getAugmentedWorldGeoJson } from './geojson'

const app = new Elysia()
  .use(cors())
  .get('/stories', () => stories)
  .get('/stories/:id', ({ params: { id }, status }) => {
    const story = stories.find((s) => s.id === id)
    if (!story) return status(404, { message: 'Story not found' })
    return story
  })
  .get('/geojson/world-countries', () => getAugmentedWorldGeoJson())
  .listen(3000)

console.log('Fact-o-Map backend running at http://localhost:3000')

export type App = typeof app
