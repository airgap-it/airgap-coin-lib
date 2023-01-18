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

import { createTezosBlockExplorer } from '../block-explorer/factory'
import {
  createTezosShieldedTezProtocol,
  SHIELDED_TEZ_GHOSTNET_PROTOCOL_NETWORK,
  SHIELDED_TEZ_MAINNET_PROTOCOL_NETWORK
} from '../protocol/sapling/TezosShieldedTezProtocol'
import { TezosSaplingProtocolNetwork } from '../types/protocol'

export class TezosShieldedModule implements AirGapModule {
  private readonly networkRegistry: ModuleNetworkRegistry<TezosSaplingProtocolNetwork> = new ModuleNetworkRegistry({
    supportedNetworks: [SHIELDED_TEZ_MAINNET_PROTOCOL_NETWORK, SHIELDED_TEZ_GHOSTNET_PROTOCOL_NETWORK]
  })

  public readonly supportedNetworks: Record<string, ProtocolNetwork> = this.networkRegistry.supportedNetworks

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createTezosShieldedTezProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: TezosSaplingProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.TEZOS, 'Protocol network type not supported.')
    }

    return createTezosShieldedTezProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: TezosSaplingProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.TEZOS, 'Block Explorer network type not supported.')
    }

    return createTezosBlockExplorer(network.blockExplorer)
  }
}
