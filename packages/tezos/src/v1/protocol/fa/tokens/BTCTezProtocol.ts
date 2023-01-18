import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type BTCTezUnits = 'BTCtz'

export interface BTCTezProtocol extends TezosFA2Protocol<BTCTezUnits> {}

// Implementation

export class BTCTezProtocolImpl extends TezosFA2ProtocolImpl<BTCTezUnits> implements BTCTezProtocol {
  public constructor(options: RecursivePartial<BTCTezProtocolOptions>) {
    const completeOptions: BTCTezProtocolOptions = createBTCTezProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'BTCtez',
      identifier: SubProtocolSymbols.XTZ_BTC_TEZ,

      units: {
        BTCtz: {
          symbol: { value: 'BTCtz' },
          decimals: 8
        }
      },
      mainUnit: 'BTCtz',

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

type BTCTezProtocolOptions = Pick<TezosFA2ProtocolOptions<BTCTezUnits>, 'network'>

export function createBTCTezProtocol(options: RecursivePartial<BTCTezProtocolOptions> = {}): BTCTezProtocol {
  return new BTCTezProtocolImpl(options)
}

export const BTCTEZ_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1T87QbpXEVgkwsNPzz8iRoah3SS3D1MDmh',
  tokenId: 0,
  tokenMetadataBigMapId: 24121,
  ledgerBigMapId: 24117
}

const DEFAULT_BTCTEZ_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = BTCTEZ_MAINNET_PROTOCOL_NETWORK

export function createBTCTezProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): BTCTezProtocolOptions {
  return {
    network: {
      ...DEFAULT_BTCTEZ_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_BTCTEZ_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_BTCTEZ_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
