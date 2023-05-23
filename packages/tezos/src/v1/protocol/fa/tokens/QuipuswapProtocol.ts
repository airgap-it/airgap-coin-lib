import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type QuipuswapUnits = 'QUIPU'

export interface QuipuswapProtocol extends TezosFA2Protocol<QuipuswapUnits> {}

// Implementation

export class QuipuswapProtocolImpl extends TezosFA2ProtocolImpl<QuipuswapUnits> implements QuipuswapProtocol {
  public constructor(options: RecursivePartial<QuipuswapProtocolOptions>) {
    const completeOptions: QuipuswapProtocolOptions = createQuipuswapProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Quipuswap Governance Token',
      identifier: SubProtocolSymbols.XTZ_QUIPU,

      units: {
        QUIPU: {
          symbol: { value: 'QUIPU' },
          decimals: 6
        }
      },
      mainUnit: 'QUIPU',

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

type QuipuswapProtocolOptions = Pick<TezosFA2ProtocolOptions<QuipuswapUnits>, 'network'>

export function createQuipuswapProtocol(options: RecursivePartial<QuipuswapProtocolOptions> = {}): QuipuswapProtocol {
  return new QuipuswapProtocolImpl(options)
}

export const QUIPUSWAP_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
  tokenId: 0,
  tokenMetadataBigMapId: 12046,
  ledgerBigMapId: 12043
}

const DEFAULT_QUIPUSWAP_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = QUIPUSWAP_MAINNET_PROTOCOL_NETWORK

export function createQuipuswapProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): QuipuswapProtocolOptions {
  return {
    network: {
      ...DEFAULT_QUIPUSWAP_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_QUIPUSWAP_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
