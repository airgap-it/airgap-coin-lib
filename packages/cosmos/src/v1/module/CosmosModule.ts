import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  ProtocolNetwork,
  protocolNetworkIdentifier
} from '@airgap/module-kit'

import { MintscanBlockExplorer } from '../block-explorer/MintscanBlockExplorer'
import { COSMOS_MAINNET_PROTOCOL_NETWORK, createCosmosProtocol } from '../protocol/CosmosProtocol'

export class CosmosModule implements AirGapModule {
  public readonly supportedNetworks: Record<string, ProtocolNetwork> = [COSMOS_MAINNET_PROTOCOL_NETWORK].reduce(
    (obj: Record<string, ProtocolNetwork>, next: ProtocolNetwork) => {
      return Object.assign(obj, { [protocolNetworkIdentifier(next)]: next })
    },
    {}
  )

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createCosmosProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.COSMOS, 'Protocol network type not supported.')
    }

    return createCosmosProtocol()
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.COSMOS, 'Block Explorer network type not supported.')
    }

    return new MintscanBlockExplorer()
  }

  private findNetwork(networkId?: string): ProtocolNetwork | undefined {
    const targetNetworkId: string = networkId ?? protocolNetworkIdentifier(COSMOS_MAINNET_PROTOCOL_NETWORK)

    return this.supportedNetworks[targetNetworkId]
  }
}
