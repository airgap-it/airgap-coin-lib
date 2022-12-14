import { BigMap } from './BigMap'
import { BigMapEntryFilter } from './BigMapEnrtyFilter'

export interface BigMapRequest {
  bigMap?: Omit<BigMap, 'valueType' | 'keyType'>
  filters?: BigMapEntryFilter[]
  key?: string
  limit?: number
}
