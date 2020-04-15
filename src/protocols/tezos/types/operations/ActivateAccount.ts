import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosActivateAccountOperation extends TezosOperation {
  kind: TezosOperationType.ACTIVATE_ACCOUNT
  pkh: string
  secret: string
}
