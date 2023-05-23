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
import { SubscanBlockExplorer } from '@airgap/substrate'

import { ASTAR_MAINNET_PROTOCOL_NETWORK, createAstarProtocol } from '../protocol/AstarProtocol'
import { createShidenProtocol, SHIDEN_MAINNET_PROTOCOL_NETWORK } from '../protocol/ShidenProtocol'
import { AstarV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { AstarProtocolNetwork } from '../types/protocol'

type SupportedProtocols = MainProtocolSymbols.ASTAR | MainProtocolSymbols.SHIDEN

export class AstarModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: AstarProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.ASTAR]: new ModuleNetworkRegistry({
      supportedNetworks: [ASTAR_MAINNET_PROTOCOL_NETWORK]
    }),
    [MainProtocolSymbols.SHIDEN]: new ModuleNetworkRegistry({
      supportedNetworks: [SHIDEN_MAINNET_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<OfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: SupportedProtocols,
    networkOrId?: AstarProtocolNetwork | string
  ): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol network type not supported. (Astar)`)
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: SupportedProtocols,
    networkOrId?: AstarProtocolNetwork | string
  ): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Block Explorer network type not supported. (Astar)`)
    }

    return new SubscanBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new AstarV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.ASTAR:
        return createAstarProtocol({ network })
      case MainProtocolSymbols.SHIDEN:
        return createShidenProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol ${identifier} not supported. (Astar)`)
    }
  }
}
