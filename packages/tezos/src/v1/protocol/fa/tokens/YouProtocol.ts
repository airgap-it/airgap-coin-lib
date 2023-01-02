import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TEZOS_MAINNET_PROTOCOL_NETWORK } from '../../TezosProtocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl } from '../TezosFA2Protocol'
import { FA_MAINNET_SOURCE_ADDRESS } from '../TezosFAProtocol'

// Interface

type YouUnits = 'YOU'

export interface YouProtocol extends TezosFA2Protocol<YouUnits> {}

// Implementation

export class YouProtocolImpl extends TezosFA2ProtocolImpl<YouUnits> implements YouProtocol {
  public constructor(options: RecursivePartial<YouProtocolOptions>) {
    const completeOptions: YouProtocolOptions = createYouProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'youves YOU Governance',
      identifier: SubProtocolSymbols.XTZ_YOU,

      units: {
        YOU: {
          symbol: { value: 'YOU', market: 'you' },
          decimals: 12
        }
      },
      mainUnit: 'YOU',

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

type YouProtocolOptions = Pick<TezosFA2ProtocolOptions<YouUnits>, 'network'>

export function createYouProtocol(options: RecursivePartial<YouProtocolOptions> = {}): YouProtocol {
  return new YouProtocolImpl(options)
}

export const YOU_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL',
  defaultSourceAddress: FA_MAINNET_SOURCE_ADDRESS,
  tokenId: 0,
  tokenMetadataBigMapId: 7718,
  ledgerBigMapId: 7715
}

const DEFAULT_YOU_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = YOU_MAINNET_PROTOCOL_NETWORK

export function createYouProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): YouProtocolOptions {
  return {
    network: {
      ...DEFAULT_YOU_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_YOU_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_YOU_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
