import { Amount } from './amount'

export interface Balance<_Units extends string = string> {
  total: Amount<_Units>
  transferable?: Amount<_Units>
}
