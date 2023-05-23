import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type TzBTCUnits = 'tzBTC'

export interface TzBTCProtocol extends TezosFA1p2Protocol<TzBTCUnits> {}

// Implementation

export class TzBTCProtocolImpl extends TezosFA1p2ProtocolImpl<TzBTCUnits> implements TzBTCProtocol {
  public constructor(options: RecursivePartial<TzBTCProtocolOptions>) {
    const completeOptions: TzBTCProtocolOptions = createTzBTCProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Tezos BTC',
      identifier: SubProtocolSymbols.XTZ_BTC,

      units: {
        tzBTC: {
          symbol: { value: 'tzBTC', market: 'btc' },
          decimals: 8
        }
      },
      mainUnit: 'tzBTC',

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

type TzBTCProtocolOptions = Pick<TezosFA1p2ProtocolOptions<TzBTCUnits>, 'network'>

export function createTzBTCProtocol(options: RecursivePartial<TzBTCProtocolOptions> = {}): TzBTCProtocol {
  return new TzBTCProtocolImpl(options)
}

export const TZBTC_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn'
}

const DEFAULT_TZBTC_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = TZBTC_MAINNET_PROTOCOL_NETWORK

export function createTzBTCProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): TzBTCProtocolOptions {
  return {
    network: {
      ...DEFAULT_TZBTC_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_TZBTC_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
