import { BigMap } from './BigMap'
import { BigMapEntryFilter } from './BigMapEnrtyFilter'
import { BigMapEntryType } from './BigMapEntry'

export interface BigMapRequest<T extends BigMapEntryType> {
  bigMap?: Omit<BigMap, 'valueType' | 'keyType'>
  filters?: BigMapEntryFilter[]
  key?: string
  limit?: number
  resultType: T
}
