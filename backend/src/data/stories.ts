import type { Story } from '@fact-o-map/types'
import {story as turing} from './turing'
import {story as dday } from './dday-normandy'
import { temperatureStory } from './global-temperature'

export const stories: Story[] = [
  dday,  
  turing,
  temperatureStory,
]
