import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapModule,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { AirGapProtocol, OfflineProtocol, OnlineProtocol } from '@airgap/module-kit/protocol/protocol'

import { EtherscanBlockExplorer } from '../block-explorer/EtherscanBlockExplorer'
import { createERC20Token, ETHEREUM_ERC20_MAINNET_PROTOCOL_NETWORK } from '../protocol/erc20/ERC20Token'
import { createEthereumProtocol, ETHEREUM_MAINNET_PROTOCOL_NETWORK } from '../protocol/EthereumProtocol'
import { EthereumV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { ERC20TokenMetadata, EthereumProtocolNetwork } from '../types/protocol'

import { erc20Tokens, erc20TokensIdentifiers } from './ERC20Tokens'

export class EthereumModule implements AirGapModule<{ ProtocolNetwork: EthereumProtocolNetwork }> {
  private readonly networkRegistries: Record<string, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<string, ProtocolConfiguration>

  public constructor() {
    const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [ETHEREUM_MAINNET_PROTOCOL_NETWORK]
    })
    const erc20NetworkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [ETHEREUM_ERC20_MAINNET_PROTOCOL_NETWORK]
    })

    this.networkRegistries = {
      [MainProtocolSymbols.ETH]: networkRegistry,
      ...erc20TokensIdentifiers.reduce(
        (obj: Record<string, ModuleNetworkRegistry>, next: string) => Object.assign(obj, { [next]: erc20NetworkRegistry }),
        {}
      )
    }
    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: string): Promise<OfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: string,
    networkOrId?: EthereumProtocolNetwork | string
  ): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(identifier: string, networkOrId?: EthereumProtocolNetwork | string): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'Block Explorer network type not supported.')
    }

    return new EtherscanBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new EthereumV3SerializerCompanion()
  }

  private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
    if (identifier === MainProtocolSymbols.ETH) {
      return createEthereumProtocol({ network })
    }

    if (erc20Tokens[identifier] !== undefined) {
      const tokenMetadata: ERC20TokenMetadata = erc20Tokens[identifier]

      return createERC20Token(tokenMetadata, { network })
    }

    throw new ConditionViolationError(Domain.ETHEREUM, `Protocol ${identifier} not supported.`)
  }
}
