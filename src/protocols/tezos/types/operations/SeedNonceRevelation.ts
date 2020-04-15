import { TezosOperationType } from '../TezosOperationType'

import { TezosOperation } from './TezosOperation'

export interface TezosSeedNonceRevelationOperation extends TezosOperation {
  kind: TezosOperationType.SEED_NONCE_REVELATION
  level: string
  nonce: string
}
