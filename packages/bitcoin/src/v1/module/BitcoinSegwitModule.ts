import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { AirGapBlockExplorer, AirGapModule, AirGapOfflineProtocol, AirGapOnlineProtocol, ProtocolNetworkType } from '@airgap/module-kit'

import { BlockCypherBlockExplorer } from '../block-explorer/BlockCypherBlockExplorer'
import { createBitcoinSegwitProtocol } from '../protocol/BitcoinSegwitProtocol'

export class BitcoinSegwitModule implements AirGapModule {
  public supportedNetworks: ProtocolNetworkType[] = ['mainnet']

  public async createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined> {
    return createBitcoinSegwitProtocol()
  }

  public async createOnlineProtocol(network: ProtocolNetworkType): Promise<AirGapOnlineProtocol | undefined> {
    if (network !== 'mainnet') {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network type not supported.')
    }

    return createBitcoinSegwitProtocol()
  }

  public async createBlockExplorer(network: ProtocolNetworkType): Promise<AirGapBlockExplorer | undefined> {
    if (network !== 'mainnet') {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network type not supported.')
    }

    return new BlockCypherBlockExplorer()
  }
}
