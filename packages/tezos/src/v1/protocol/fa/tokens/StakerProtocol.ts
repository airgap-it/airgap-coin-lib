import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { Amount, newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type StakerUnits = 'STKR'

export interface StakerProtocol extends TezosFA1p2Protocol<StakerUnits> {}

// Implementation

export class StakerProtocolImpl extends TezosFA1p2ProtocolImpl<StakerUnits> implements StakerProtocol {
  public constructor(options: RecursivePartial<StakerProtocolOptions>) {
    const completeOptions: StakerProtocolOptions = createStakerProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Staker',
      identifier: SubProtocolSymbols.XTZ_STKR,

      units: {
        STKR: {
          symbol: { value: 'STKR', market: 'stkr' },
          decimals: 6
        }
      },
      mainUnit: 'STKR',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.3, 'tez'),
        high: newAmount(0.5, 'tez')
      }
    })
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: Amount<StakerUnits> }[]> {
    return this.indexer.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}

// Factory

type StakerProtocolOptions = Pick<TezosFA1p2ProtocolOptions<StakerUnits>, 'network'>

export function createStakerProtocol(options: RecursivePartial<StakerProtocolOptions> = {}): StakerProtocol {
  return new StakerProtocolImpl(options)
}

export const STAKER_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv'
}

const DEFAULT_STAKER_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = STAKER_MAINNET_PROTOCOL_NETWORK

export function createStakerProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): StakerProtocolOptions {
  return {
    network: {
      ...DEFAULT_STAKER_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_STAKER_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
