import { getStory } from '$lib/api'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, fetch }) => {
  const story = await getStory(params.id, fetch)
  return { story }
}
