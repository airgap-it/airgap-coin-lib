import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TEZOS_MAINNET_PROTOCOL_NETWORK } from '../../TezosProtocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl } from '../TezosFA2Protocol'
import { FA_MAINNET_SOURCE_ADDRESS } from '../TezosFAProtocol'

// Interface

type UUSDUnits = 'uUSD'

export interface UUSDProtocol extends TezosFA2Protocol<UUSDUnits> {}

// Implementation

export class UUSDProtocolImpl extends TezosFA2ProtocolImpl<UUSDUnits> implements UUSDProtocol {
  public constructor(options: RecursivePartial<UUSDProtocolOptions>) {
    const completeOptions: UUSDProtocolOptions = createUUSDProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'youves uUSD',
      identifier: SubProtocolSymbols.XTZ_UUSD,

      units: {
        uUSD: {
          symbol: { value: 'uUSD' },
          decimals: 12
        }
      },
      mainUnit: 'uUSD',

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

type UUSDProtocolOptions = Pick<TezosFA2ProtocolOptions<UUSDUnits>, 'network'>

export function createUUSDProtocol(options: RecursivePartial<UUSDProtocolOptions> = {}): UUSDProtocol {
  return new UUSDProtocolImpl(options)
}

export const UUSD_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
  defaultSourceAddress: FA_MAINNET_SOURCE_ADDRESS,
  tokenId: 0,
  tokenMetadataBigMapId: 7708,
  ledgerBigMapId: 7706
}

const DEFAULT_UUSD_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = UUSD_MAINNET_PROTOCOL_NETWORK

export function createUUSDProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): UUSDProtocolOptions {
  return {
    network: {
      ...DEFAULT_UUSD_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_UUSD_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_UUSD_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
