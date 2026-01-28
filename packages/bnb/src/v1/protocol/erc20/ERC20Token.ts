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

import { HttpBnbNodeClient } from '../../client/node/HttpBnbNodeClient'
import { BnbProtocolNetwork, BnbProtocolOptions } from '../../types/protocol'
import { BnbBaseProtocol, BnbBaseProtocolImpl } from '../BnbBaseProtocol'
import { BNB_MAINNET_PROTOCOL_NETWORK } from '../BnbProtocol'

// Interface

export interface ERC20Token extends AirGapInterface<BnbBaseProtocol<string>, 'SingleTokenSubProtocol'> {
  name(): Promise<string | undefined>
  symbol(): Promise<string | undefined>
  decimals(): Promise<number | undefined>

  tokenMetadata(): Promise<ERC20TokenMetadata>
}

// Implementation

class ERC20TokenImpl
  extends BnbBaseProtocolImpl<string, EthereumERC20TokenImpl<BnbProtocolNetwork>, ERC20TokenOptions<BnbProtocolNetwork>>
  implements ERC20Token
{
  constructor(options: ERC20TokenOptions<BnbProtocolNetwork>) {
    const nodeClient = new HttpBnbNodeClient(options.network.rpcUrl)
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

export function createERC20Token(metadata: ERC20TokenMetadata, options: RecursivePartial<BnbProtocolOptions> = {}): ERC20Token {
  const completeOptions = createERC20TokenOptions(metadata, options.network)

  return new ERC20TokenImpl(completeOptions)
}

export const BNB_ERC20_MAINNET_PROTOCOL_NETWORK: BnbProtocolNetwork = BNB_MAINNET_PROTOCOL_NETWORK

const DEFAULT_ERC20_PROTOCOL_NETWORK: BnbProtocolNetwork = BNB_ERC20_MAINNET_PROTOCOL_NETWORK

export function createERC20TokenOptions(
  metadata: ERC20TokenMetadata,
  network: Partial<EthereumProtocolNetwork> = {}
): ERC20TokenOptions<BnbProtocolNetwork> {
  return {
    network: { ...DEFAULT_ERC20_PROTOCOL_NETWORK, ...network },
    name: metadata.name,
    identifier: metadata.identifier,
    mainIdentifier: MainProtocolSymbols.BNB,

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
  network: BnbProtocolNetwork
}

export async function serializeERC20Token(erc20Token: ERC20Token): Promise<SerializedERC20Token> {
  const [tokenMetadata, network]: [ERC20TokenMetadata, BnbProtocolNetwork] = await Promise.all([
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
