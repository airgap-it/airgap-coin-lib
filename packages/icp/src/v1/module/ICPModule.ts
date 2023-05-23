import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'

import { ICPBlockExplorer } from '../block-explorer/ICPBlockExplorer'
import { createICPProtocol, ICP_MAINNET_PROTOCOL_NETWORK } from '../protocol/ICPProtocol'
import { CKBTC_MAINNET_PROTOCOL_NETWORK, createCkBTCOfflineProtocol, createCkBTCOnlineProtocol } from '../protocol/icrc/CkBTCProtocol'
import { ICPV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { ICPProtocolNetwork } from '../types/protocol'

type SupportedProtocols = MainProtocolSymbols.ICP | MainProtocolSymbols.ICP_CKBTC

export class ICPModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: ICPProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.ICP]: new ModuleNetworkRegistry({
      supportedNetworks: [ICP_MAINNET_PROTOCOL_NETWORK]
    }),
    [MainProtocolSymbols.ICP_CKBTC]: new ModuleNetworkRegistry({
      supportedNetworks: [CKBTC_MAINNET_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new ICPV3SerializerCompanion()
  }

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<AirGapOfflineProtocol | undefined> {
    switch (identifier) {
      case MainProtocolSymbols.ICP:
        return createICPProtocol()
      case MainProtocolSymbols.ICP_CKBTC:
        return createCkBTCOfflineProtocol()
      default:
        throw new ConditionViolationError(Domain.ICP, `Protocol ${identifier} not supported.`)
    }
  }

  public async createOnlineProtocol(
    identifier: SupportedProtocols,
    networkOrId?: ICPProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.ICP, 'Protocol network not supported.')
    }

    switch (identifier) {
      case MainProtocolSymbols.ICP:
        return createICPProtocol({ network })
      case MainProtocolSymbols.ICP_CKBTC:
        return createCkBTCOnlineProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.ICP, `Protocol ${identifier} not supported.`)
    }
  }

  public async createBlockExplorer(
    identifier: SupportedProtocols,
    networkOrId?: ICPProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.ICP, 'Block Explorer network not supported.')
    }

    return new ICPBlockExplorer(network.blockExplorerUrl)
  }
}
