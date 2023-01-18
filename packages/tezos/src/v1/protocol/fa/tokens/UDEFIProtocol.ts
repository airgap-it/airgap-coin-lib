import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type UDEFIUnits = 'uDEFI'

export interface UDEFIProtocol extends TezosFA2Protocol<UDEFIUnits> {}

// Implementation

export class UDEFIProtocolImpl extends TezosFA2ProtocolImpl<UDEFIUnits> implements UDEFIProtocol {
  public constructor(options: RecursivePartial<UDEFIProtocolOptions>) {
    const completeOptions: UDEFIProtocolOptions = createUDEFIProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'youves uDEFI',
      identifier: SubProtocolSymbols.XTZ_UDEFI,

      units: {
        uDEFI: {
          symbol: { value: 'uDEFI' },
          decimals: 12
        }
      },
      mainUnit: 'uDEFI',

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

type UDEFIProtocolOptions = Pick<TezosFA2ProtocolOptions<UDEFIUnits>, 'network'>

export function createUDEFIProtocol(options: RecursivePartial<UDEFIProtocolOptions> = {}): UDEFIProtocol {
  return new UDEFIProtocolImpl(options)
}

export const UDEFI_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
  tokenId: 1,
  tokenMetadataBigMapId: 7708,
  ledgerBigMapId: 7706
}

const DEFAULT_UDEFI_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = UDEFI_MAINNET_PROTOCOL_NETWORK

export function createUDEFIProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): UDEFIProtocolOptions {
  return {
    network: {
      ...DEFAULT_UDEFI_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_UDEFI_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_UDEFI_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
