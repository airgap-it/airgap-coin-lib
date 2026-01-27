import { MainProtocolSymbols } from '@airgap/coinlib-core'
import {
  DEFAULT_ETHEREUM_UNITS_METADATA,
  EthereumBaseProtocolImpl,
  EthereumBaseProtocolOptions,
  EtherscanInfoClient
} from '@airgap/ethereum/v1'
import { newAmount, RecursivePartial } from '@airgap/module-kit'

import { HttpBnbNodeClient } from '../client/node/HttpBnbNodeClient'
import { BnbProtocolNetwork, BnbProtocolOptions, BnbUnits } from '../types/protocol'

import { BnbBaseProtocol, BnbBaseProtocolImpl, DEFAULT_BNB_UNITS_METADATA } from './BnbBaseProtocol'

// Interface

export interface BnbProtocol extends BnbBaseProtocol {}

// Implementation

class BnbProtocolImpl extends BnbBaseProtocolImpl implements BnbProtocol {
  constructor(options: RecursivePartial<BnbProtocolOptions>) {
    const completeOptions = createBnbProtocolOptions(options.network)

    const nodeClient = new HttpBnbNodeClient(completeOptions.network.rpcUrl)
    const infoClient = new EtherscanInfoClient(completeOptions.network.blockExplorerApi)

    const baseProtocolOptions: EthereumBaseProtocolOptions<BnbUnits, BnbProtocolNetwork> = {
      network: completeOptions.network,

      identifier: MainProtocolSymbols.BNB,
      name: 'BNB Smart Chain',

      units: DEFAULT_BNB_UNITS_METADATA,
      mainUnit: 'BNB',

      feeDefaults: {
        low: newAmount(63000 /* 21000 GAS * 3 GWEI */, 'GWEI').blockchain(DEFAULT_ETHEREUM_UNITS_METADATA),
        medium: newAmount(105000 /* 21000 GAS * 5 GWEI */, 'GWEI').blockchain(DEFAULT_ETHEREUM_UNITS_METADATA),
        high: newAmount(210000 /* 21000 GAS * 10 GWEI */, 'GWEI').blockchain(DEFAULT_ETHEREUM_UNITS_METADATA)
      }
    }

    const ethereumProtocol = new EthereumBaseProtocolImpl(nodeClient, infoClient, baseProtocolOptions)

    super(ethereumProtocol, nodeClient, infoClient, completeOptions)
  }
}

// Factory

export function createBnbProtocol(options: RecursivePartial<BnbProtocolOptions> = {}): BnbProtocol {
  return new BnbProtocolImpl(options)
}

export const BNB_MAINNET_PROTOCOL_NETWORK: BnbProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://bsc-rpc.publicnode.com',
  chainId: 56,
  blockExplorerUrl: 'https://bscscan.com',
  blockExplorerApi: 'https://api.bscscan.com/api'
}

const DEFAULT_BNB_PROTOCOL_NETWORK: BnbProtocolNetwork = BNB_MAINNET_PROTOCOL_NETWORK

export function createBnbProtocolOptions(network: Partial<BnbProtocolNetwork> = {}): BnbProtocolOptions {
  return {
    network: { ...DEFAULT_BNB_PROTOCOL_NETWORK, ...network }
  }
}
