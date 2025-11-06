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

import { ACURAST_MAINNET_PROTOCOL_NETWORK, createAcurastProtocol } from '../protocol/AcurastProtocol'
import { AcurastV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { AcurastProtocolNetwork } from '../types/protocol'
import { ACURAST_CANARY_PROTOCOL_NETWORK, createAcurastCanaryProtocol } from '../protocol/AcurastCanaryProtocol'

type SupportedProtocols = MainProtocolSymbols.ACURAST | MainProtocolSymbols.ACURAST_CANARY

export class AcurastModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: AcurastProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.ACURAST]: new ModuleNetworkRegistry({
      supportedNetworks: [ACURAST_MAINNET_PROTOCOL_NETWORK]
    }),
    [MainProtocolSymbols.ACURAST_CANARY]: new ModuleNetworkRegistry({
      supportedNetworks: [ACURAST_CANARY_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<OfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: SupportedProtocols,
    networkOrId?: AcurastProtocolNetwork | string
  ): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol network type not supported. (Acurast)`)
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: SupportedProtocols,
    networkOrId?: AcurastProtocolNetwork | string
  ): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Block Explorer network type not supported. (Acurast)`)
    }

    return new SubscanBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new AcurastV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    if (identifier === MainProtocolSymbols.ACURAST) {
      return createAcurastProtocol({ network })
    } else if (identifier === MainProtocolSymbols.ACURAST_CANARY) {
      return createAcurastCanaryProtocol({ network })
    } else {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol ${identifier} not supported. (Acurast)`)
    }
  }
}
