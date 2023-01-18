import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type TetherUSDUnits = 'USDt'

export interface TetherUSDProtocol extends TezosFA2Protocol<TetherUSDUnits> {}

// Implementation

export class TetherUSDProtocolImpl extends TezosFA2ProtocolImpl<TetherUSDUnits> implements TetherUSDProtocol {
  public constructor(options: RecursivePartial<TetherUSDProtocolOptions>) {
    const completeOptions: TetherUSDProtocolOptions = createTetherUSDProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Tether USD',
      identifier: SubProtocolSymbols.XTZ_USDT,

      units: {
        USDt: {
          symbol: { value: 'USDt', market: 'USDT' },
          decimals: 6
        }
      },
      mainUnit: 'USDt',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.2, 'tez'),
        high: newAmount(0.3, 'tez')
      }
    })
  }
}

// Factory

type TetherUSDProtocolOptions = Pick<TezosFA2ProtocolOptions<TetherUSDUnits>, 'network'>

export function createTetherUSDProtocol(options: RecursivePartial<TetherUSDProtocolOptions> = {}): TetherUSDProtocol {
  return new TetherUSDProtocolImpl(options)
}

export const TETHERUSD_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1XnTn74bUtxHfDtBmm2bGZAQfhPbvKWR8o',
  tokenId: 0,
  tokenMetadataBigMapId: 198034,
  ledgerBigMapId: 198031
}

const DEFAULT_TETHERUSD_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = TETHERUSD_MAINNET_PROTOCOL_NETWORK

export function createTetherUSDProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): TetherUSDProtocolOptions {
  return {
    network: {
      ...DEFAULT_TETHERUSD_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_TETHERUSD_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_TETHERUSD_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
