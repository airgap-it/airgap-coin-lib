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

const MAINNET_NAME: string = 'Mainnet'
const NODE_URL: string = 'https://ropsten.infura.io'
const CHAIN_ID: number = 3
const BLOCK_EXPLORER_API: string = 'https://api-ropsten.etherscan.io/'
export const ETHEREUM_ROPSTEN_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: MAINNET_NAME,
  type: 'mainnet',
  rpcUrl: NODE_URL,
  chainId: CHAIN_ID,
  blockExplorerApi: BLOCK_EXPLORER_API
}

const DEFAULT_ETHEREUM_ROPSTEN_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_ROPSTEN_MAINNET_PROTOCOL_NETWORK

export function createEthereumRopstenProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_ROPSTEN_PROTOCOL_NETWORK, ...network }
  }
}
