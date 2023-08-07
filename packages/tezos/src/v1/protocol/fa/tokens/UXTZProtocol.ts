import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type UXTZUnits = 'uXTZ'

export interface UXTZProtocol extends TezosFA2Protocol<UXTZUnits> {}

// Implementation

export class UXTZProtocolImpl extends TezosFA2ProtocolImpl<UXTZUnits> implements UXTZProtocol {
  public constructor(options: RecursivePartial<UXTZProtocolOptions>) {
    const completeOptions: UXTZProtocolOptions = createUXTZProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'youves uXTZ',
      identifier: SubProtocolSymbols.XTZ_UXTZ,

      units: {
        uXTZ: {
          symbol: { value: 'uXTZ' },
          decimals: 12
        }
      },
      mainUnit: 'uXTZ',

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

type UXTZProtocolOptions = Pick<TezosFA2ProtocolOptions<UXTZUnits>, 'network'>

export function createUXTZProtocol(options: RecursivePartial<UXTZProtocolOptions> = {}): UXTZProtocol {
  return new UXTZProtocolImpl(options)
}

export const UXTZ_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
  tokenId: 3,
  tokenMetadataBigMapId: 7708,
  ledgerBigMapId: 7706
}

const DEFAULT_UXTZ_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = UXTZ_MAINNET_PROTOCOL_NETWORK

export function createUXTZProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): UXTZProtocolOptions {
  return {
    network: {
      ...DEFAULT_UXTZ_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_UXTZ_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
