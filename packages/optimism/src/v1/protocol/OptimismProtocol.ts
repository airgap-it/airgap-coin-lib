import { MainProtocolSymbols } from '@airgap/coinlib-core'
import {
  DEFAULT_ETHEREUM_UNITS_METADATA,
  EthereumBaseProtocolImpl,
  EthereumBaseProtocolOptions,
  EthereumUnits,
  EtherscanInfoClient
} from '@airgap/ethereum/v1'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { AirGapNodeClient } from '../client/node/AirGapNodeClient'
import { OptimismProtocolNetwork, OptimismProtocolOptions } from '../types/protocol'

import { OptimismBaseProtocol, OptimismBaseProtocolImpl } from './OptimismBaseProtocol'

// Interface

export interface OptimismProtocol extends OptimismBaseProtocol {}

// Implementation

class OptimismProtocolImpl extends OptimismBaseProtocolImpl implements OptimismProtocol {
  constructor(options: RecursivePartial<OptimismProtocolOptions>) {
    const completeOptions = createOptimismProtocolOptions(options.network)

    const nodeClient = new AirGapNodeClient(completeOptions.network.rpcUrl)
    const infoClient = new EtherscanInfoClient(completeOptions.network.blockExplorerApi)

    const baseProtocolOptions: EthereumBaseProtocolOptions<EthereumUnits, OptimismProtocolNetwork> = {
      network: completeOptions.network,

      identifier: MainProtocolSymbols.OPTIMISM,
      name: 'Optimism',

      units: {
        ...DEFAULT_ETHEREUM_UNITS_METADATA,
        ETH: {
          symbol: { ...DEFAULT_ETHEREUM_UNITS_METADATA.ETH.symbol, asset: 'OP' },
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

export function createOptimismProtocol(options: RecursivePartial<OptimismProtocolOptions> = {}): OptimismProtocol {
  return new OptimismProtocolImpl(options)
}

export const OPTIMISM_MAINNET_PROTOCOL_NETWORK: OptimismProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://optimism-node.prod.gke.papers.tech',
  chainId: 10,
  blockExplorerUrl: 'https://optimistic.etherscan.io',
  blockExplorerApi: 'https://optimism-indexer.prod.gke.papers.tech',
  gasPriceOracleAddress: '0x420000000000000000000000000000000000000F'
}

const DEFAULT_OPTIMISM_PROTOCOL_NETWORK: OptimismProtocolNetwork = OPTIMISM_MAINNET_PROTOCOL_NETWORK

export function createOptimismProtocolOptions(network: Partial<OptimismProtocolNetwork> = {}): OptimismProtocolOptions {
  return {
    network: { ...DEFAULT_OPTIMISM_PROTOCOL_NETWORK, ...network }
  }
}
