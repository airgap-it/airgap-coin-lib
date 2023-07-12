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

import { MinaExplorerBlockExplorer } from '../block-explorer/MinaExplorerBlockExplorer'
import { createMinaProtocol } from '../module'
import { MINA_MAINNET_PROTOCOL_NETWORK } from '../protocol/MinaProtocol'
import { MinaV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { MinaProtocolNetwork } from '../types/protocol'

export class MinaModule implements AirGapModule {
  private readonly networkRegistries: Record<string, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<string, ProtocolConfiguration>

  public constructor() {
    const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [MINA_MAINNET_PROTOCOL_NETWORK]
    })

    this.networkRegistries = {
      [MainProtocolSymbols.MINA]: networkRegistry
    }
    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: string,
    networkOrId?: MinaProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.MINA, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: string,
    networkOrId?: MinaProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.MINA, 'Block Explorer network type not supported.')
    }

    return new MinaExplorerBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new MinaV3SerializerCompanion()
  }

  private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.MINA:
        return createMinaProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.MINA, `Protocol ${identifier} not supported.`)
    }
  }
}
