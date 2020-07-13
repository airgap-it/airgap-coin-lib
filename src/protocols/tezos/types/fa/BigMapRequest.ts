import { BigMapPredicate } from './BigMapPredicate'

export interface BigMapRequest {
  bigMapID?: number
  predicates?: BigMapPredicate[]

  bigMapFilter?: BigMapPredicate[]
}