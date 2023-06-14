import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { Amount, newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type PlentyUnits = 'PLENTY'

export interface PlentyProtocol extends TezosFA1p2Protocol<PlentyUnits> {}

// Implementation

export class PlentyProtocolImpl extends TezosFA1p2ProtocolImpl<PlentyUnits> implements PlentyProtocol {
  public constructor(options: RecursivePartial<PlentyProtocolOptions>) {
    const completeOptions: PlentyProtocolOptions = createPlentyProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Plenty DAO',
      identifier: SubProtocolSymbols.XTZ_PLENTY,

      units: {
        PLENTY: {
          symbol: { value: 'PLENTY' },
          decimals: 18
        }
      },
      mainUnit: 'PLENTY',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.3, 'tez'),
        high: newAmount(0.5, 'tez')
      }
    })
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: Amount<PlentyUnits> }[]> {
    return this.indexer.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}

// Factory

type PlentyProtocolOptions = Pick<TezosFA1p2ProtocolOptions<PlentyUnits>, 'network'>

export function createPlentyProtocol(options: RecursivePartial<PlentyProtocolOptions> = {}): PlentyProtocol {
  return new PlentyProtocolImpl(options)
}

export const PLENTY_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b'
}

const DEFAULT_PLENTY_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = PLENTY_MAINNET_PROTOCOL_NETWORK

export function createPlentyProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): PlentyProtocolOptions {
  return {
    network: {
      ...DEFAULT_PLENTY_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_PLENTY_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
