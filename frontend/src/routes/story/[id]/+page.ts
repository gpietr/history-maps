import { getStory } from '$lib/api'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const story = await getStory(params.id)
  return { story }
}
