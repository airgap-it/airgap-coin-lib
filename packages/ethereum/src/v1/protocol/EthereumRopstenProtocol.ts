import { RecursivePartial } from '@airgap/module-kit'

import { EtherscanInfoClient } from '../clients/info/EtherscanInfoClient'
import { AirGapNodeClient } from '../clients/node/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolOptions } from '../types/protocol'

import { DefaultEthereumBaseProtocolImpl, EthereumBaseProtocol } from './EthereumBaseProtocol'

// Interface

export interface EthereumRopstenProtocol extends EthereumBaseProtocol {}

// Implementation

class EthereumRopstenProtocolImpl extends DefaultEthereumBaseProtocolImpl implements EthereumRopstenProtocol {
  public constructor(options: RecursivePartial<EthereumProtocolOptions> = {}) {
    const completeOptions: EthereumProtocolOptions = createEthereumRopstenProtocolOptions(options.network)

    super(
      new AirGapNodeClient(completeOptions.network.rpcUrl),
      new EtherscanInfoClient(completeOptions.network.blockExplorerApi),
      completeOptions
    )
  }
}

// Factory

export function createEthereumRopstenProtocol(options: RecursivePartial<EthereumProtocolOptions> = {}): EthereumRopstenProtocol {
  return new EthereumRopstenProtocolImpl(options)
}

export const ETHEREUM_ROPSTEN_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://ropsten.infura.io',
  chainId: 3,
  blockExplorerApi: 'https://api-ropsten.etherscan.io/'
}

const DEFAULT_ETHEREUM_ROPSTEN_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_ROPSTEN_MAINNET_PROTOCOL_NETWORK

export function createEthereumRopstenProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_ROPSTEN_PROTOCOL_NETWORK, ...network }
  }
}
