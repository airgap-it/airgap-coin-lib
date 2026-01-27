import { MainProtocolSymbols } from '@airgap/coinlib-core'
import {
  DEFAULT_ETHEREUM_UNITS_METADATA,
  EthereumBaseProtocolImpl,
  EthereumBaseProtocolOptions,
  EthereumUnits,
  EtherscanInfoClient
} from '@airgap/ethereum/v1'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { HttpBaseNodeClient } from '../client/node/HttpBaseNodeClient'
import { BaseProtocolNetwork, BaseProtocolOptions } from '../types/protocol'

import { BaseBaseProtocol, BaseBaseProtocolImpl } from './BaseBaseProtocol'

// Interface

export interface BaseProtocol extends BaseBaseProtocol {}

// Implementation

class BaseProtocolImpl extends BaseBaseProtocolImpl implements BaseProtocol {
  constructor(options: RecursivePartial<BaseProtocolOptions>) {
    const completeOptions = createBaseProtocolOptions(options.network)

    const nodeClient = new HttpBaseNodeClient(completeOptions.network.rpcUrl)
    const infoClient = new EtherscanInfoClient(completeOptions.network.blockExplorerApi)

    const baseProtocolOptions: EthereumBaseProtocolOptions<EthereumUnits, BaseProtocolNetwork> = {
      network: completeOptions.network,

      identifier: MainProtocolSymbols.BASE,
      name: 'Base',

      units: {
        ...DEFAULT_ETHEREUM_UNITS_METADATA,
        ETH: {
          symbol: { ...DEFAULT_ETHEREUM_UNITS_METADATA.ETH.symbol, asset: 'BASE' },
          decimals: DEFAULT_ETHEREUM_UNITS_METADATA.ETH.decimals
        }
      },
      mainUnit: 'ETH',

      // The layer 2 gas price is normally 0.001 gwei, but it increases when experiencing heavy congestion
      feeDefaults: {
        low: newAmount(15.75 /* 21000 GAS * 0.00075 GWEI */, 'GWEI').blockchain(DEFAULT_ETHEREUM_UNITS_METADATA),
        medium: newAmount(22.05 /* 21000 GAS * 0.00105 GWEI */, 'GWEI').blockchain(DEFAULT_ETHEREUM_UNITS_METADATA),
        high: newAmount(44.1 /* 21000 GAS * 0.0021 GWEI */, 'GWEI').blockchain(DEFAULT_ETHEREUM_UNITS_METADATA)
      }
    }

    const ethereumProtocol = new EthereumBaseProtocolImpl(nodeClient, infoClient, baseProtocolOptions)

    super(ethereumProtocol, nodeClient, infoClient, completeOptions)
  }
}

// Factory

export function createBaseProtocol(options: RecursivePartial<BaseProtocolOptions> = {}): BaseProtocol {
  return new BaseProtocolImpl(options)
}

export const BASE_MAINNET_PROTOCOL_NETWORK: BaseProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://base-rpc.publicnode.com',
  chainId: 8453,
  blockExplorerUrl: 'https://basescan.org',
  blockExplorerApi: 'https://api.basescan.org/api',
  gasPriceOracleAddress: '0x420000000000000000000000000000000000000F'
}

const DEFAULT_BASE_PROTOCOL_NETWORK: BaseProtocolNetwork = BASE_MAINNET_PROTOCOL_NETWORK

export function createBaseProtocolOptions(network: Partial<BaseProtocolNetwork> = {}): BaseProtocolOptions {
  return {
    network: { ...DEFAULT_BASE_PROTOCOL_NETWORK, ...network }
  }
}
