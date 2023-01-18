import { Amount } from './amount'

export interface FeeDefaults<_Units extends string = string> {
  low: Amount<_Units>
  medium: Amount<_Units>
  high: Amount<_Units>
}

export type FeeEstimation<_Units extends string = string> = FeeDefaults<_Units> | Amount<_Units>
