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

import { createKusamaProtocol, KUSAMA_MAINNET_PROTOCOL_NETWORK } from '../protocol/KusamaProtocol'
import { createPolkadotProtocol, POLKADOT_MAINNET_PROTOCOL_NETWORK } from '../protocol/PolkadotProtocol'
import { PolkadotV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { PolkadotProtocolNetwork } from '../types/protocol'

type SupportedProtocols = MainProtocolSymbols.POLKADOT | MainProtocolSymbols.KUSAMA

export class PolkadotModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: PolkadotProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.POLKADOT]: new ModuleNetworkRegistry({
      supportedNetworks: [POLKADOT_MAINNET_PROTOCOL_NETWORK]
    }),
    [MainProtocolSymbols.KUSAMA]: new ModuleNetworkRegistry({
      supportedNetworks: [KUSAMA_MAINNET_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<OfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: SupportedProtocols,
    networkOrId?: PolkadotProtocolNetwork | string
  ): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol network type not supported. (Polkadot)`)
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: SupportedProtocols,
    networkOrId?: PolkadotProtocolNetwork | string
  ): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Block Explorer network type not supported. (Polkadot)`)
    }

    return new SubscanBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new PolkadotV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.POLKADOT:
        return createPolkadotProtocol({ network })
      case MainProtocolSymbols.KUSAMA:
        return createKusamaProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol ${identifier} not supported. (Polkadot)`)
    }
  }
}
