import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TEZOS_MAINNET_PROTOCOL_NETWORK } from '../../TezosProtocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl } from '../TezosFA1p2Protocol'
import { FA1_MAINNET_CALLBACK_CONTRACT } from '../TezosFA1Protocol'
import { FA_MAINNET_SOURCE_ADDRESS } from '../TezosFAProtocol'

// Interface

type DogamiUnits = 'DOGA'

export interface DogamiProtocol extends TezosFA1p2Protocol<DogamiUnits> {}

// Implementation

export class DogamiProtocolImpl extends TezosFA1p2ProtocolImpl<DogamiUnits> implements DogamiProtocol {
  public constructor(options: RecursivePartial<DogamiProtocolOptions>) {
    const completeOptions: DogamiProtocolOptions = createDogamiProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'DOGAMI',
      identifier: SubProtocolSymbols.XTZ_DOGA,

      units: {
        DOGA: {
          symbol: { value: 'DOGA' },
          decimals: 5
        }
      },
      mainUnit: 'DOGA',

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

type DogamiProtocolOptions = Pick<TezosFA1p2ProtocolOptions<DogamiUnits>, 'network'>

export function createDogamiProtocol(options: RecursivePartial<DogamiProtocolOptions> = {}): DogamiProtocol {
  return new DogamiProtocolImpl(options)
}

export const DOGAMI_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8',
  defaultSourceAddress: FA_MAINNET_SOURCE_ADDRESS,
  defaultCallbackContract: FA1_MAINNET_CALLBACK_CONTRACT
}

const DEFAULT_DOGAMI_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = DOGAMI_MAINNET_PROTOCOL_NETWORK

export function createDogamiProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): DogamiProtocolOptions {
  return {
    network: {
      ...DEFAULT_DOGAMI_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_DOGAMI_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_DOGAMI_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
