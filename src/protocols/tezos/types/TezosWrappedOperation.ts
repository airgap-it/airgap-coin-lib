import { TezosOperation } from './operations/TezosOperation'

export interface TezosWrappedOperation {
  branch: string
  contents: TezosOperation[]
}
