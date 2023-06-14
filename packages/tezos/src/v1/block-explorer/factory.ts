import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AirGapBlockExplorer } from '@airgap/module-kit'

import { TezosBlockExplorerType } from '../types/block-explorer'

import { TzKTBlockExplorer } from './TzKTBlockExplorer'

export function createTezosBlockExplorer(type: TezosBlockExplorerType, url: string): AirGapBlockExplorer {
  switch (type) {
    case 'tzkt':
      return new TzKTBlockExplorer(url)
    default:
      assertNever(type)
      throw new UnsupportedError(Domain.TEZOS, 'Unknown block explorer type.')
  }
}
