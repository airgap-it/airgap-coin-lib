import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { Amount, newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TEZOS_MAINNET_PROTOCOL_NETWORK } from '../../TezosProtocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl } from '../TezosFA1p2Protocol'
import { FA1_MAINNET_CALLBACK_CONTRACT } from '../TezosFA1Protocol'
import { FA_MAINNET_SOURCE_ADDRESS } from '../TezosFAProtocol'

// Interface

type ETHTezUnits = 'ETHtz'

export interface ETHTezProtocol extends TezosFA1p2Protocol<ETHTezUnits> {}

// Implementation

export class ETHTezProtocolImpl extends TezosFA1p2ProtocolImpl<ETHTezUnits> implements ETHTezProtocol {
  public constructor(options: RecursivePartial<ETHTezProtocolOptions>) {
    const completeOptions: ETHTezProtocolOptions = createETHTezProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'ETHtez',
      identifier: SubProtocolSymbols.XTZ_ETHTZ,

      units: {
        ETHtz: {
          symbol: { value: 'ETHtz', market: 'ethtz' },
          decimals: 18
        }
      },
      mainUnit: 'ETHtz',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.3, 'tez'),
        high: newAmount(0.5, 'tez')
      }
    })
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: Amount<ETHTezUnits> }[]> {
    return this.indexer.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}

// Factory

type ETHTezProtocolOptions = Pick<TezosFA1p2ProtocolOptions<ETHTezUnits>, 'network'>

export function createETHTezProtocol(options: RecursivePartial<ETHTezProtocolOptions> = {}): ETHTezProtocol {
  return new ETHTezProtocolImpl(options)
}

export const ETHTEZ_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8',
  defaultSourceAddress: FA_MAINNET_SOURCE_ADDRESS,
  defaultCallbackContract: FA1_MAINNET_CALLBACK_CONTRACT
}

const DEFAULT_ETHTEZ_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = ETHTEZ_MAINNET_PROTOCOL_NETWORK

export function createETHTezProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): ETHTezProtocolOptions {
  return {
    network: {
      ...DEFAULT_ETHTEZ_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_ETHTEZ_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_ETHTEZ_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
