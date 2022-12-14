import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'

import { TezosIndexer } from '../types/indexer'

import { TezosIndexerClient } from './TezosIndexerClient'
import { TzKTIndexerClient } from './TzKTIndexerClient'

export function createTezosIndexerClient(indexer: TezosIndexer): TezosIndexerClient {
  switch (indexer.type) {
    case 'tzkt':
      return new TzKTIndexerClient(indexer.apiUrl)
    default:
      assertNever(indexer.type)
      throw new UnsupportedError(Domain.TEZOS, 'Unknown indexer type.')
  }
}
