import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { AirGapBlockExplorer, AirGapModule, AirGapOfflineProtocol, AirGapOnlineProtocol, ProtocolNetworkType } from '@airgap/module-kit'
import { AeternityBlockExplorer } from '../block-explorer/AeternityBlockExplorer'
import { createAeternityProtocol } from '../protocol/AeternityProtocol'

export class AeternityModule implements AirGapModule {
  public supportedNetworks: ProtocolNetworkType[] = ['mainnet']

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createAeternityProtocol()
  }

  public async createOnlineProtocol(network: ProtocolNetworkType): Promise<AirGapOnlineProtocol | undefined> {
    if (network !== 'mainnet') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Protocol network type not supported.')
    }

    return createAeternityProtocol()
  }

  public async createBlockExplorer(network: ProtocolNetworkType): Promise<AirGapBlockExplorer | undefined> {
    if (network !== 'mainnet') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Block Explorer network type not supported.')
    }

    return new AeternityBlockExplorer()
  }
}
