import { Domain, MainProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { ERC20TokenMetadata, EtherscanBlockExplorer } from '@airgap/ethereum/v1'
import {
  AirGapAnyProtocol,
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapSerializedAnyProtocol,
  AirGapSerializedOfflineProtocol,
  AirGapSerializedOnlineProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolMetadata,
  ProtocolNetwork
} from '@airgap/module-kit'

import { isOptimismERC20Token } from '../module'
import {
  createERC20Token,
  deserializeERC20Token,
  isSerializedERC20Token,
  OPTIMISM_ERC20_MAINNET_PROTOCOL_NETWORK,
  serializeERC20Token
} from '../protocol/erc20/ERC20Token'
import { createOptimismProtocol, OPTIMISM_MAINNET_PROTOCOL_NETWORK } from '../protocol/OptimismProtocol'
import { OptimismV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { OptimismProtocolNetwork } from '../types/protocol'

import { erc20Tokens, erc20TokensIdentifiers } from './ERC20Tokens'

export class OptimismModule implements AirGapModule<{}, 'ProtocolSerializer'> {
  private readonly networkRegistries: Record<string, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<string, ProtocolConfiguration>

  public constructor() {
    const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [OPTIMISM_MAINNET_PROTOCOL_NETWORK]
    })
    const erc20NetworkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [OPTIMISM_ERC20_MAINNET_PROTOCOL_NETWORK]
    })

    this.networkRegistries = {
      [MainProtocolSymbols.OPTIMISM]: networkRegistry,
      ...erc20TokensIdentifiers.reduce(
        (obj: Record<string, ModuleNetworkRegistry>, next: string) => Object.assign(obj, { [next]: erc20NetworkRegistry }),
        {}
      )
    }
    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: string,
    networkOrId?: OptimismProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.OPTIMISM, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: string,
    networkOrId?: OptimismProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.OPTIMISM, 'Block Explorer network type not supported.')
    }

    return new EtherscanBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new OptimismV3SerializerCompanion()
  }

  private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
    if (identifier === MainProtocolSymbols.OPTIMISM) {
      return createOptimismProtocol({ network })
    }

    if (erc20Tokens[identifier] !== undefined) {
      const tokenMetadata: ERC20TokenMetadata = erc20Tokens[identifier]

      return createERC20Token(tokenMetadata)
    }

    throw new ConditionViolationError(Domain.OPTIMISM, `Protocol ${identifier} not supported.`)
  }

  // ProtocolSerializer

  public async serializeOfflineProtocol(protocol: AirGapOfflineProtocol): Promise<AirGapSerializedOfflineProtocol | undefined> {
    return this.serializeProtocol(protocol, 'offline')
  }

  public async deserializeOfflineProtocol(serialized: AirGapSerializedOfflineProtocol): Promise<AirGapOfflineProtocol | undefined> {
    return this.deserializeProtocol(serialized)
  }

  public async serializeOnlineProtocol(protocol: AirGapOnlineProtocol): Promise<AirGapSerializedOnlineProtocol | undefined> {
    return this.serializeProtocol(protocol, 'online')
  }

  public async deserializeOnlineProtocol(serialized: AirGapSerializedOnlineProtocol): Promise<AirGapOnlineProtocol | undefined> {
    return this.deserializeProtocol(serialized)
  }

  private async serializeProtocol<T extends AirGapSerializedAnyProtocol['type']>(
    protocol: AirGapAnyProtocol,
    type: T
  ): Promise<
    | (T extends 'offline'
        ? AirGapSerializedOfflineProtocol | undefined
        : T extends 'online'
        ? AirGapSerializedOnlineProtocol | undefined
        : never)
    | undefined
  > {
    if (isOptimismERC20Token(protocol)) {
      const [metadata, serializedProtocol]: [ProtocolMetadata, any] = await Promise.all([
        protocol.getMetadata(),
        serializeERC20Token(protocol)
      ])

      return {
        type,
        identifier: metadata.identifier,
        ...serializedProtocol
      }
    }

    return undefined
  }

  private deserializeProtocol(serialized: AirGapSerializedAnyProtocol): AirGapProtocol | undefined {
    if (serialized.identifier.startsWith(SubProtocolSymbols.OPTIMISM_ERC20) && isSerializedERC20Token(serialized)) {
      return deserializeERC20Token(serialized)
    }

    return undefined
  }
}
