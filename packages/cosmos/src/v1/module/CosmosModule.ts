import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  ModuleNetworkRegistry,
  ProtocolNetwork
} from '@airgap/module-kit'

import { MintscanBlockExplorer } from '../block-explorer/MintscanBlockExplorer'
import { COSMOS_MAINNET_PROTOCOL_NETWORK, createCosmosProtocol } from '../protocol/CosmosProtocol'

export class CosmosModule implements AirGapModule {
  private readonly networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
    supportedNetworks: [COSMOS_MAINNET_PROTOCOL_NETWORK]
  })

  public readonly supportedNetworks: Record<string, ProtocolNetwork> = this.networkRegistry.supportedNetworks

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createCosmosProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.COSMOS, 'Protocol network type not supported.')
    }

    return createCosmosProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.COSMOS, 'Block Explorer network type not supported.')
    }

    return new MintscanBlockExplorer()
  }
}
