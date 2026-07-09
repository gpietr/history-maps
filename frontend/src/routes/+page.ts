import { getStories } from '$lib/api'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  const stories = await getStories()
  return { stories }
}
