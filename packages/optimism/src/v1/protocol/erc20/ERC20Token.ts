// Factory

import { MainProtocolSymbols } from '@airgap/coinlib-core'
import {
  ERC20TokenImpl as EthereumERC20TokenImpl,
  ERC20TokenMetadata,
  ERC20TokenOptions,
  EthereumProtocolNetwork,
  EtherscanInfoClient
} from '@airgap/ethereum/v1'
import { AirGapInterface, implementsInterface, RecursivePartial } from '@airgap/module-kit'

import { HttpOptimismNodeClient } from '../../client/node/HttpOptimismNodeClient'
import { OptimismProtocolNetwork, OptimismProtocolOptions } from '../../types/protocol'
import { OptimismBaseProtocol, OptimismBaseProtocolImpl } from '../OptimismBaseProtocol'
import { OPTIMISM_MAINNET_PROTOCOL_NETWORK } from '../OptimismProtocol'

// Interface

export interface ERC20Token extends AirGapInterface<OptimismBaseProtocol<string>, 'SingleTokenSubProtocol'> {
  name(): Promise<string | undefined>
  symbol(): Promise<string | undefined>
  decimals(): Promise<number | undefined>

  tokenMetadata(): Promise<ERC20TokenMetadata>
}

// Implementation

class ERC20TokenImpl
  extends OptimismBaseProtocolImpl<string, EthereumERC20TokenImpl<OptimismProtocolNetwork>, ERC20TokenOptions<OptimismProtocolNetwork>>
  implements ERC20Token {
  constructor(options: ERC20TokenOptions<OptimismProtocolNetwork>) {
    const nodeClient = new HttpOptimismNodeClient(options.network.rpcUrl)
    const infoClient = new EtherscanInfoClient(options.network.blockExplorerApi)

    const ethereumProtocol = new EthereumERC20TokenImpl(nodeClient, infoClient, options)

    super(ethereumProtocol, nodeClient, infoClient, options)
  }

  // SubProtocol

  public async getType(): Promise<'token'> {
    return this.ethereumProtocol.getType()
  }

  public async mainProtocol(): Promise<string> {
    return this.ethereumProtocol.mainProtocol()
  }

  public async getContractAddress(): Promise<string> {
    return this.ethereumProtocol.getContractAddress()
  }

  // Custom

  public async name(): Promise<string | undefined> {
    return this.ethereumProtocol.name()
  }

  public async symbol(): Promise<string | undefined> {
    return this.ethereumProtocol.symbol()
  }

  public async decimals(): Promise<number | undefined> {
    return this.ethereumProtocol.decimals()
  }

  public async tokenMetadata(): Promise<ERC20TokenMetadata> {
    const mainUnit = this.options.units[this.options.mainUnit]

    return {
      name: this.options.name,
      identifier: this.options.identifier,
      symbol: mainUnit.symbol.value,
      marketSymbol: mainUnit.symbol.market ?? mainUnit.symbol.value,
      contractAddress: this.options.contractAddress,
      decimals: mainUnit.decimals
    }
  }
}

// Factory

export function createERC20Token(metadata: ERC20TokenMetadata, options: RecursivePartial<OptimismProtocolOptions> = {}): ERC20Token {
  const completeOptions = createERC20TokenOptions(metadata, options.network)

  return new ERC20TokenImpl(completeOptions)
}

export const OPTIMISM_ERC20_MAINNET_PROTOCOL_NETWORK: OptimismProtocolNetwork = OPTIMISM_MAINNET_PROTOCOL_NETWORK

const DEFAULT_ERC20_PROTOCOL_NETWORK: OptimismProtocolNetwork = OPTIMISM_ERC20_MAINNET_PROTOCOL_NETWORK

export function createERC20TokenOptions(
  metadata: ERC20TokenMetadata,
  network: Partial<EthereumProtocolNetwork> = {}
): ERC20TokenOptions<OptimismProtocolNetwork> {
  return {
    network: { ...DEFAULT_ERC20_PROTOCOL_NETWORK, ...network },
    name: metadata.name,
    identifier: metadata.identifier,
    mainIdentifier: MainProtocolSymbols.OPTIMISM,

    contractAddress: metadata.contractAddress,

    units: {
      [metadata.symbol]: {
        symbol: { value: metadata.symbol, market: metadata.marketSymbol },
        decimals: metadata.decimals
      }
    },
    mainUnit: metadata.symbol
  }
}

// Serializer

export interface SerializedERC20Token {
  metadata: ERC20TokenMetadata
  network: OptimismProtocolNetwork
}

export async function serializeERC20Token(erc20Token: ERC20Token): Promise<SerializedERC20Token> {
  const [tokenMetadata, network]: [ERC20TokenMetadata, OptimismProtocolNetwork] = await Promise.all([
    erc20Token.tokenMetadata(),
    erc20Token.getNetwork()
  ])

  return { metadata: tokenMetadata, network }
}

export function deserializeERC20Token(serialized: SerializedERC20Token): ERC20Token {
  return createERC20Token(serialized.metadata, { network: serialized.network })
}

export function isSerializedERC20Token(serialized: unknown): serialized is SerializedERC20Token {
  return implementsInterface<SerializedERC20Token>(serialized, { metadata: 'required', network: 'required' })
}
