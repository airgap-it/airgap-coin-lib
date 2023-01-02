import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TEZOS_MAINNET_PROTOCOL_NETWORK } from '../../TezosProtocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl } from '../TezosFA1p2Protocol'
import { FA1_MAINNET_CALLBACK_CONTRACT } from '../TezosFA1Protocol'
import { FA_MAINNET_SOURCE_ADDRESS } from '../TezosFAProtocol'

// Interface

type WrappedTezosUnits = 'Wtz'

export interface WrappedTezosProtocol extends TezosFA1p2Protocol<WrappedTezosUnits> {}

// Implementation

export class WrappedTezosProtocolImpl extends TezosFA1p2ProtocolImpl<WrappedTezosUnits> implements WrappedTezosProtocol {
  public constructor(options: RecursivePartial<WrappedTezosProtocolOptions>) {
    const completeOptions: WrappedTezosProtocolOptions = createWrappedTezosProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Wrapped Tezos',
      identifier: SubProtocolSymbols.XTZ_W,

      units: {
        Wtz: {
          symbol: { value: 'Wtz', market: 'wtz' },
          decimals: 6
        }
      },
      mainUnit: 'Wtz',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.3, 'tez'),
        high: newAmount(0.5, 'tez')
      }
    })
  }
}

// Factory

type WrappedTezosProtocolOptions = Pick<TezosFA1p2ProtocolOptions<WrappedTezosUnits>, 'network'>

export function createWrappedTezosProtocol(options: RecursivePartial<WrappedTezosProtocolOptions> = {}): WrappedTezosProtocol {
  return new WrappedTezosProtocolImpl(options)
}

export const WRAPPED_TEZOS_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH',
  defaultSourceAddress: FA_MAINNET_SOURCE_ADDRESS,
  defaultCallbackContract: FA1_MAINNET_CALLBACK_CONTRACT
}

const DEFAULT_WRAPPED_TEZOS_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = WRAPPED_TEZOS_MAINNET_PROTOCOL_NETWORK

export function createWrappedTezosProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): WrappedTezosProtocolOptions {
  return {
    network: {
      ...DEFAULT_WRAPPED_TEZOS_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_WRAPPED_TEZOS_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_WRAPPED_TEZOS_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
