// @ts-ignore
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
import { RecursivePartial } from '@airgap/module-kit'

import { EtherscanInfoClient } from '../clients/info/EtherscanInfoClient'
import { AirGapNodeClient } from '../clients/node/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolOptions } from '../types/protocol'

import { DefaultEthereumBaseProtocolImpl, EthereumBaseProtocol } from './EthereumBaseProtocol'

// Interface

// TODO: move Bip32 implementation to EthereumBaseProtocol
export interface EthereumProtocol extends EthereumBaseProtocol {}

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
}

// Factory

export function createEthereumProtocol(options: RecursivePartial<EthereumProtocolOptions> = {}): EthereumProtocol {
  return new EthereumProtocolImpl(options)
}

export const ETHEREUM_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
  chainId: 1,
  blockExplorerApi: 'https://api.etherscan.io'
}

const DEFAULT_ETHEREUM_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_MAINNET_PROTOCOL_NETWORK

export function createEthereumProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_PROTOCOL_NETWORK, ...network }
  }
}
