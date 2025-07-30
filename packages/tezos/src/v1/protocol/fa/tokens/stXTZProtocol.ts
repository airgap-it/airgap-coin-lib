import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TEZOS_FA2_MAINNET_PROTOCOL_NETWORK, TezosFA2Protocol, TezosFA2ProtocolImpl } from '../TezosFA2Protocol'

// Interface

type stXTZUnits = 'stXTZ'

export interface STXTZProtocol extends TezosFA2Protocol<stXTZUnits> {}

// Implementation

export class STXTZProtocolImpl extends TezosFA2ProtocolImpl<stXTZUnits> implements STXTZProtocol {
  public constructor(options: RecursivePartial<stXTZProtocolOptions>) {
    const completeOptions: stXTZProtocolOptions = createstXTZProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'stXTZ',
      identifier: SubProtocolSymbols.XTZ_STXTZ,

      units: {
        stXTZ: {
          symbol: { value: 'stXTZ' },
          decimals: 6
        }
      },
      mainUnit: 'stXTZ',

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

type stXTZProtocolOptions = Pick<TezosFA2ProtocolOptions<stXTZUnits>, 'network'>

export function createstXTZProtocol(options: RecursivePartial<stXTZProtocolOptions> = {}): STXTZProtocol {
  return new STXTZProtocolImpl(options)
}

export const STXTZ_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1KXKhkxDezoa8G3WvPtsrgNTs5ZQwhpYZN',
  tokenId: 0,
  tokenMetadataBigMapId: 729397,
  ledgerBigMapId: 729395
}

const DEFAULT_STXTZ_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = STXTZ_MAINNET_PROTOCOL_NETWORK

export function createstXTZProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): stXTZProtocolOptions {
  return {
    network: {
      ...DEFAULT_STXTZ_PROTOCOL_NETWORK,
      ...network,
      callbackContracts: {
        ...DEFAULT_STXTZ_PROTOCOL_NETWORK.callbackContracts,
        ...network.callbackContracts
      }
    }
  }
}
