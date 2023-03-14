import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
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

import { MintscanBlockExplorer } from '../block-explorer/MintscanBlockExplorer'
import { COSMOS_MAINNET_PROTOCOL_NETWORK, createCosmosProtocol } from '../protocol/CosmosProtocol'
import { CosmosV3SerializerCompanion } from '../serializer/v3/serializer-companion'

type SupportedProtocols = MainProtocolSymbols.COSMOS

export class CosmosModule implements AirGapModule<{ Protocols: SupportedProtocols }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.COSMOS]: new ModuleNetworkRegistry({
      supportedNetworks: [COSMOS_MAINNET_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(identifier: SupportedProtocols, networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.COSMOS, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(identifier: SupportedProtocols, networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.COSMOS, 'Block Explorer network type not supported.')
    }

    return new MintscanBlockExplorer()
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new CosmosV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.COSMOS:
        return createCosmosProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.COSMOS, `Protocol ${identifier} not supported.`)
    }
  }
}
