import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA1p2ProtocolNetwork, TezosFA1p2ProtocolOptions } from '../../../types/protocol'
import { TezosFA1p2Protocol, TezosFA1p2ProtocolImpl, TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA1p2Protocol'

// Interface

type USDTezUnits = 'USDtz'

export interface USDTezProtocol extends TezosFA1p2Protocol<USDTezUnits> {}

// Implementation

export class USDTezProtocolImpl extends TezosFA1p2ProtocolImpl<USDTezUnits> implements USDTezProtocol {
  public constructor(options: RecursivePartial<USDTezProtocolOptions>) {
    const completeOptions: USDTezProtocolOptions = createUSDTezProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'USD Tez',
      identifier: SubProtocolSymbols.XTZ_USD,

      units: {
        USDtz: {
          symbol: { value: 'USDtz' },
          decimals: 8
        }
      },
      mainUnit: 'USDtz',

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

type USDTezProtocolOptions = Pick<TezosFA1p2ProtocolOptions<USDTezUnits>, 'network'>

export function createUSDTezProtocol(options: RecursivePartial<USDTezProtocolOptions> = {}): USDTezProtocol {
  return new USDTezProtocolImpl(options)
}

export const USDTEZ_MAINNET_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = {
  ...TEZOS_FA1P2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9'
}

const DEFAULT_USDTEZ_PROTOCOL_NETWORK: TezosFA1p2ProtocolNetwork = USDTEZ_MAINNET_PROTOCOL_NETWORK

export function createUSDTezProtocolOptions(network: RecursivePartial<TezosFA1p2ProtocolNetwork> = {}): USDTezProtocolOptions {
  return {
    network: {
      ...DEFAULT_USDTEZ_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_USDTEZ_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
