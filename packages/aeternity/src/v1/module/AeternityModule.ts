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

import { AeternityBlockExplorer } from '../block-explorer/AeternityBlockExplorer'
import { AETERNITY_MAINNET_PROTOCOL_NETWORK, createAeternityProtocol } from '../protocol/AeternityProtocol'

export class AeternityModule implements AirGapModule {
  private readonly networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
    supportedNetworks: [AETERNITY_MAINNET_PROTOCOL_NETWORK]
  })

  public supportedNetworks: Record<string, ProtocolNetwork> = this.networkRegistry.supportedNetworks

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createAeternityProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.AETERNITY, 'Protocol network not supported.')
    }

    return createAeternityProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Block Explorer network not supported.')
    }

    return new AeternityBlockExplorer()
  }
}
