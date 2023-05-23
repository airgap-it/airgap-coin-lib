import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'

import { TezosIndexerType } from '../types/indexer'

import { TezosIndexerClient } from './TezosIndexerClient'
import { TzKTIndexerClient } from './TzKTIndexerClient'

export function createTezosIndexerClient(type: TezosIndexerType, apiUrl: string): TezosIndexerClient {
  switch (type) {
    case 'tzkt':
      return new TzKTIndexerClient(apiUrl)
    default:
      assertNever(type)
      throw new UnsupportedError(Domain.TEZOS, 'Unknown indexer type.')
  }
}
