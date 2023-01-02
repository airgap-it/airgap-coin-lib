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
import { createTezosKtProtocol } from '../protocol/kt/TezosKtProtocol'
import { TEZOS_MAINNET_PROTOCOL_NETWORK } from '../protocol/TezosProtocol'
import { TezosProtocolNetwork } from '../types/protocol'

export class TezosKtModule implements AirGapModule {
  private readonly networkRegistry: ModuleNetworkRegistry<TezosProtocolNetwork> = new ModuleNetworkRegistry({
    supportedNetworks: [TEZOS_MAINNET_PROTOCOL_NETWORK]
  })

  public readonly supportedNetworks: Record<string, ProtocolNetwork> = this.networkRegistry.supportedNetworks

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createTezosKtProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: TezosProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.TEZOS, 'Protocol network type not supported.')
    }

    return createTezosKtProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: TezosProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.TEZOS, 'Block Explorer network type not supported.')
    }

    return createTezosBlockExplorer(network.blockExplorer)
  }
}
