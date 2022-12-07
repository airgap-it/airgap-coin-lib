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

import { BlockCypherBlockExplorer } from '../block-explorer/BlockCypherBlockExplorer'
import { BITCOIN_MAINNET_PROTOCOL_NETWORK, createBitcoinProtocol } from '../protocol/BitcoinProtocol'

export class BitcoinModule implements AirGapModule {
  private readonly networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
    supportedNetworks: [BITCOIN_MAINNET_PROTOCOL_NETWORK]
  })

  public supportedNetworks: Record<string, ProtocolNetwork> = this.networkRegistry.supportedNetworks

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createBitcoinProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network not supported.')
    }

    return createBitcoinProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.BITCOIN, 'Block Explorer network not supported.')
    }

    return new BlockCypherBlockExplorer()
  }
}
