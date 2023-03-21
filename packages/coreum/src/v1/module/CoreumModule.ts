import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapModule,
  AirGapProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'
import { AirGapBlockExplorer, AirGapOfflineProtocol, AirGapOnlineProtocol } from '@airgap/module-kit'
import { CoreumBlockExplorer } from '../block-explorer/CoreumExplorer'
import { COREUM_PROTOCOL_NETWORK, createCoreumProtocol } from '../protocol/CoreumProtocol'
import { CoreumV3SerializerCompanion } from '../serializer/v3/serializer-companion'

type SupportedProtocols = MainProtocolSymbols.COREUM

export class CoreumModule implements AirGapModule<{ Protocols: SupportedProtocols }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.COREUM]: new ModuleNetworkRegistry({
      supportedNetworks: [COREUM_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<MainProtocolSymbols.COREUM, ProtocolConfiguration> = createSupportedProtocols(
    this.networkRegistries
  )

  public async createOfflineProtocol(identifier: MainProtocolSymbols.COREUM): Promise<AirGapOfflineProtocol<{}> | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: MainProtocolSymbols.COREUM,
    networkId?: string | undefined
  ): Promise<AirGapOnlineProtocol<{}> | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.COREUM, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: MainProtocolSymbols.COREUM,
    networkId?: string | undefined
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.COSMOS, 'Block Explorer network type not supported.')
    }

    return new CoreumBlockExplorer()
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
