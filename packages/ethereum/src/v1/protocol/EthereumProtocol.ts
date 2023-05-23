import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { Amount, newAmount, RecursivePartial } from '@airgap/module-kit'

import { EtherscanInfoClient } from '../clients/info/EtherscanInfoClient'
import { AirGapNodeClient } from '../clients/node/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolOptions, EthereumUnits } from '../types/protocol'

import { DefaultEthereumBaseProtocolImpl, EthereumBaseProtocol } from './EthereumBaseProtocol'

// Interface

// TODO: move Bip32 implementation to EthereumBaseProtocol
export interface EthereumProtocol extends EthereumBaseProtocol {
  getGasPrice(): Promise<Amount<EthereumUnits>>
  fetchTransactionCountForAddress(address: string): Promise<number>
}

// Implementation

class EthereumProtocolImpl extends DefaultEthereumBaseProtocolImpl implements EthereumProtocol {
  public constructor(options: RecursivePartial<EthereumProtocolOptions> = {}) {
    const completeOptions: EthereumProtocolOptions = createEthereumProtocolOptions(options.network)

    super(
      new AirGapNodeClient(completeOptions.network.rpcUrl),
      new EtherscanInfoClient(completeOptions.network.blockExplorerApi),
      completeOptions
    )
  }

  // Custom

  public async getGasPrice(): Promise<Amount<EthereumUnits>> {
    const gasPrice: BigNumber = await this.nodeClient.getGasPrice()

    return newAmount(gasPrice, 'blockchain')
  }

  public async fetchTransactionCountForAddress(address: string): Promise<number> {
    return this.nodeClient.fetchTransactionCount(address)
  }
}

// Factory

export function createEthereumProtocol(options: RecursivePartial<EthereumProtocolOptions> = {}): EthereumProtocol {
  return new EthereumProtocolImpl(options)
}

export const ETHEREUM_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
  blockExplorerUrl: 'https://etherscan.io',
  chainId: 1,
  blockExplorerApi: 'https://api.etherscan.io'
}

const DEFAULT_ETHEREUM_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_MAINNET_PROTOCOL_NETWORK

export function createEthereumProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_PROTOCOL_NETWORK, ...network }
  }
}
