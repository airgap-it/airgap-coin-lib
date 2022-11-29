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

import { AeternityBlockExplorer } from '../block-explorer/AeternityBlockExplorer'
import { AETERNITY_MAINNET_PROTOCOL_NETWORK, createAeternityProtocol } from '../protocol/AeternityProtocol'

export class AeternityModule implements AirGapModule {
  public supportedNetworks: Record<string, ProtocolNetwork> = [AETERNITY_MAINNET_PROTOCOL_NETWORK].reduce(
    (obj: Record<string, ProtocolNetwork>, next: ProtocolNetwork) => {
      return Object.assign(obj, { [protocolNetworkIdentifier(next)]: next })
    },
    {}
  )

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createAeternityProtocol()
  }

  public async createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.AETERNITY, 'Protocol network not supported.')
    }

    return createAeternityProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Block Explorer network not supported.')
    }

    return new AeternityBlockExplorer()
  }

  private findNetwork(networkId?: string): ProtocolNetwork | undefined {
    const targetNetworkId: string = networkId ?? protocolNetworkIdentifier(AETERNITY_MAINNET_PROTOCOL_NETWORK)

    return this.supportedNetworks[targetNetworkId]
  }
}
