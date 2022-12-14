import { TezosOperation } from './kinds/TezosOperation'

export interface TezosWrappedOperation {
  branch: string
  contents: TezosOperation[]
}
