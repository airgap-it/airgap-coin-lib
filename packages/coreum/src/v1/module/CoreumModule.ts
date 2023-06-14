import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { CosmosProtocolNetwork } from '@airgap/cosmos-core'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'

import { CoreumBlockExplorer } from '../block-explorer/CoreumExplorer'
import { COREUM_PROTOCOL_NETWORK, createCoreumProtocol } from '../protocol/CoreumProtocol'
import { CoreumV3SerializerCompanion } from '../serializer/v3/serializer-companion'

type SupportedProtocols = MainProtocolSymbols.COREUM

export class CoreumModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: CosmosProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.COREUM]: new ModuleNetworkRegistry({
      supportedNetworks: [COREUM_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<MainProtocolSymbols.COREUM, ProtocolConfiguration> = createSupportedProtocols(
    this.networkRegistries
  )

  public async createOfflineProtocol(identifier: MainProtocolSymbols.COREUM): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: MainProtocolSymbols.COREUM,
    networkOrId?: CosmosProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.COREUM, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: MainProtocolSymbols.COREUM,
    networkOrId?: CosmosProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.COSMOS, 'Block Explorer network type not supported.')
    }

    return new CoreumBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new CoreumV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.COREUM:
        return createCoreumProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.COREUM, `Protocol ${identifier} not supported.`)
    }
  }
}
