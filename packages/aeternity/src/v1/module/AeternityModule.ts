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

import { AeternityBlockExplorer } from '../block-explorer/AeternityBlockExplorer'
import { AETERNITY_MAINNET_PROTOCOL_NETWORK, createAeternityProtocol } from '../protocol/AeternityProtocol'
import { AeternityV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { AeternityProtocolNetwork } from '../types/protocol'

type SupportedProtocols = MainProtocolSymbols.AE

export class AeternityModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: AeternityProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.AE]: new ModuleNetworkRegistry({
      supportedNetworks: [AETERNITY_MAINNET_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: SupportedProtocols,
    networkOrId?: AeternityProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.AETERNITY, 'Protocol network not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: SupportedProtocols,
    networkOrId?: AeternityProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.AETERNITY, 'Block Explorer network not supported.')
    }

    return new AeternityBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new AeternityV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.AE:
        return createAeternityProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.AETERNITY, `Protocol ${identifier} not supported.`)
    }
  }
}
