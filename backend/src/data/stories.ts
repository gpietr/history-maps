import type { Story } from '@fact-o-map/types'
import {story as turing} from './turing'
import {story as dday } from './dday-normandy'
import { temperatureStory } from './global-temperature'
import { worldPoliticsStory } from './world-politics'
import { romanEmpireStory } from './roman-empire'

export const stories: Story[] = [
  dday,
  turing,
  temperatureStory,
  worldPoliticsStory,
  romanEmpireStory,
]
