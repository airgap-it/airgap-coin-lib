import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'

import { BlockCypherBlockExplorer } from '../block-explorer/BlockCypherBlockExplorer'
import { BITCOIN_MAINNET_PROTOCOL_NETWORK, createBitcoinProtocol } from '../protocol/BitcoinProtocol'
import { createBitcoinSegwitProtocol } from '../protocol/BitcoinSegwitProtocol'
import { BitcoinV3SerializerCompanion } from '../serializer/v3/serializer-companion'

type SupportedProtocols = MainProtocolSymbols.BTC | MainProtocolSymbols.BTC_SEGWIT

export class BitcoinModule implements AirGapModule<{ Protocols: SupportedProtocols }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration>

  public constructor() {
    const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [BITCOIN_MAINNET_PROTOCOL_NETWORK]
    })
    this.networkRegistries = {
      [MainProtocolSymbols.BTC]: networkRegistry,
      [MainProtocolSymbols.BTC_SEGWIT]: networkRegistry
    }
    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(identifier: SupportedProtocols, networkId?: string): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network not supported.')
    }

    return createBitcoinProtocol({ network })
  }

  public async createBlockExplorer(identifier: SupportedProtocols, networkId?: string): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.BITCOIN, 'Block Explorer network not supported.')
    }

    return new BlockCypherBlockExplorer()
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new BitcoinV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        return createBitcoinProtocol()
      case MainProtocolSymbols.BTC_SEGWIT:
        return createBitcoinSegwitProtocol()
      default:
        throw new ConditionViolationError(Domain.BITCOIN, `Protocol ${identifier} not supported.`)
    }
  }
}
