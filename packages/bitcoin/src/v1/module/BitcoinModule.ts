import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { AirGapBlockExplorer, AirGapModule, AirGapOfflineProtocol, AirGapOnlineProtocol, ProtocolNetworkType } from '@airgap/module-kit'

import { BlockCypherBlockExplorer } from '../block-explorer/BlockCypherBlockExplorer'
import { createBitcoinProtocol } from '../protocol/BitcoinProtocol'

export class BitcoinModule implements AirGapModule {
  public supportedNetworks: ProtocolNetworkType[] = ['mainnet']

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createBitcoinProtocol()
  }

  public async createOnlineProtocol(network: ProtocolNetworkType): Promise<AirGapOnlineProtocol | undefined> {
    if (network !== 'mainnet') {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network type not supported.')
    }

    return createBitcoinProtocol()
  }

  public async createBlockExplorer(network: ProtocolNetworkType): Promise<AirGapBlockExplorer | undefined> {
    if (network !== 'mainnet') {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network type not supported.')
    }

    return new BlockCypherBlockExplorer()
  }
}
