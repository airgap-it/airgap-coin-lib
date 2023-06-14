import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { Amount, newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type KolibriUSDUnits = 'kUSD'

export interface KolibriUSDProtocol extends TezosFA1p2Protocol<KolibriUSDUnits> {}

// Implementation

export class KolibriUSDProtocolImpl extends TezosFA1p2ProtocolImpl<KolibriUSDUnits> implements KolibriUSDProtocol {
  public constructor(options: RecursivePartial<KolibriUSDProtocolOptions>) {
    const completeOptions: KolibriUSDProtocolOptions = createKolibriUSDProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Kolibri USD',
      identifier: SubProtocolSymbols.XTZ_KUSD,

      units: {
        kUSD: {
          symbol: { value: 'kUSD' },
          decimals: 18
        }
      },
      mainUnit: 'kUSD',

      feeDefaults: {
        // TODO: check why it is so high
        low: newAmount(0.1, 'tez'),
        medium: newAmount(0.3, 'tez'),
        high: newAmount(0.3, 'tez')
      }
    })
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: Amount<KolibriUSDUnits> }[]> {
    return this.indexer.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}

// Factory

type KolibriUSDProtocolOptions = Pick<TezosFA1p2ProtocolOptions<KolibriUSDUnits>, 'network'>

export function createKolibriUSDProtocol(options: RecursivePartial<KolibriUSDProtocolOptions> = {}): KolibriUSDProtocol {
  return new KolibriUSDProtocolImpl(options)
}

export const KOLIBRIUSD_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV'
}

const DEFAULT_KOLIBRIUSD_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = KOLIBRIUSD_MAINNET_PROTOCOL_NETWORK

export function createKolibriUSDProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): KolibriUSDProtocolOptions {
  return {
    network: {
      ...DEFAULT_KOLIBRIUSD_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_KOLIBRIUSD_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
