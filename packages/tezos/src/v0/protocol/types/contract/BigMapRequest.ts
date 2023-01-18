import { BigMap } from './BigMap'
import { BigMapEntryType } from './BigMapEntry'
import { BigMapEntryFilter } from './BigMapEntryFilter'

export interface BigMapRequest<T extends BigMapEntryType> {
  bigMap?: Omit<BigMap, 'valueType' | 'keyType'>
  filters?: BigMapEntryFilter[]
  key?: string
  limit?: number
  resultType: T
}
