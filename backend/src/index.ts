import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { stories } from './data/stories'

const app = new Elysia()
  .use(cors())
  .get('/stories', () => stories)
  .get('/stories/:id', ({ params: { id }, error }) => {
    const story = stories.find((s) => s.id === id)
    if (!story) return error(404, { message: 'Story not found' })
    return story
  })
  .listen(3000)

console.log('ChronoMap backend running at http://localhost:3000')

export type App = typeof app
