import { getStories } from '$lib/api'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const stories = await getStories(fetch)
  return { stories }
}
