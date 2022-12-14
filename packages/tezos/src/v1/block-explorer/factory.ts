import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapBlockExplorer } from '@airgap/module-kit'

import { TezosBlockExplorer } from '../types/block-explorer'

import { TzKTBlockExplorer } from './TzKTBlockExplorer'

export function createTezosBlockExplorer(blockExplorer: TezosBlockExplorer): AirGapBlockExplorer {
  switch (blockExplorer.type) {
    case 'tzkt':
      return new TzKTBlockExplorer(blockExplorer.url)
    default:
      assertNever(blockExplorer.type)
      throw new UnsupportedError(Domain.TEZOS, 'Unknown block explorer type.')
  }
}
