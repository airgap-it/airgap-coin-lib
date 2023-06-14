import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type UBTCUnits = 'uBTC'

export interface UBTCProtocol extends TezosFA2Protocol<UBTCUnits> {}

// Implementation

export class UBTCProtocolImpl extends TezosFA2ProtocolImpl<UBTCUnits> implements UBTCProtocol {
  public constructor(options: RecursivePartial<UBTCProtocolOptions>) {
    const completeOptions: UBTCProtocolOptions = createUBTCProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'youves uBTC',
      identifier: SubProtocolSymbols.XTZ_UBTC,

      units: {
        uBTC: {
          symbol: { value: 'uBTC' },
          decimals: 12
        }
      },
      mainUnit: 'uBTC',

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

type UBTCProtocolOptions = Pick<TezosFA2ProtocolOptions<UBTCUnits>, 'network'>

export function createUBTCProtocol(options: RecursivePartial<UBTCProtocolOptions> = {}): UBTCProtocol {
  return new UBTCProtocolImpl(options)
}

export const UBTC_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
  tokenId: 2,
  tokenMetadataBigMapId: 7708,
  ledgerBigMapId: 7706
}

const DEFAULT_UBTC_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = UBTC_MAINNET_PROTOCOL_NETWORK

export function createUBTCProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): UBTCProtocolOptions {
  return {
    network: {
      ...DEFAULT_UBTC_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_UBTC_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
