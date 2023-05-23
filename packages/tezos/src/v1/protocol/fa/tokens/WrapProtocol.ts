import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { TezosFA2ProtocolNetwork, TezosFA2ProtocolOptions } from '../../../types/protocol'
import { TezosFA2Protocol, TezosFA2ProtocolImpl, TEZOS_FA2_MAINNET_PROTOCOL_NETWORK } from '../TezosFA2Protocol'

// Interface

type WrapUnits = 'WRAP'

export interface WrapProtocol extends TezosFA2Protocol<WrapUnits> {}

// Implementation

export class WrapProtocolImpl extends TezosFA2ProtocolImpl<WrapUnits> implements WrapProtocol {
  public constructor(options: RecursivePartial<WrapProtocolOptions>) {
    const completeOptions: WrapProtocolOptions = createWrapProtocolOptions(options.network)

    super({
      network: completeOptions.network,

      name: 'Wrap Governance Token',
      identifier: SubProtocolSymbols.XTZ_WRAP,

      units: {
        WRAP: {
          symbol: { value: 'WRAP' },
          decimals: 8
        }
      },
      mainUnit: 'WRAP',

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

type WrapProtocolOptions = Pick<TezosFA2ProtocolOptions<WrapUnits>, 'network'>

export function createWrapProtocol(options: RecursivePartial<WrapProtocolOptions> = {}): WrapProtocol {
  return new WrapProtocolImpl(options)
}

export const WRAP_MAINNET_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = {
  ...TEZOS_FA2_MAINNET_PROTOCOL_NETWORK,
  contractAddress: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
  tokenId: 0,
  tokenMetadataBigMapId: 1779,
  ledgerBigMapId: 1777
}

const DEFAULT_WRAP_PROTOCOL_NETWORK: TezosFA2ProtocolNetwork = WRAP_MAINNET_PROTOCOL_NETWORK

export function createWrapProtocolOptions(network: RecursivePartial<TezosFA2ProtocolNetwork> = {}): WrapProtocolOptions {
  return {
    network: {
      ...DEFAULT_WRAP_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_WRAP_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_WRAP_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      },
      defaultCallbackContracts: {
        ...DEFAULT_WRAP_PROTOCOL_NETWORK.defaultCallbackContracts,
        ...network.defaultCallbackContracts
      }
    }
  }
}
