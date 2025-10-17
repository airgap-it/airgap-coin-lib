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
// import { BITCOIN_MAINNET_PROTOCOL_NETWORK, createBitcoinProtocol } from '../protocol/BitcoinProtocol'
import { BITCOIN_MAINNET_PROTOCOL_NETWORK } from '../protocol/BitcoinProtocol'
import { createBitcoinSegwitProtocol } from '../protocol/BitcoinSegwitProtocol'
import { createBitcoinTaprootProtocol } from '../protocol/BitcoinTaprootProtocol'
import { BitcoinV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { BitcoinProtocolNetwork } from '../types/protocol'
import { createBitcoinLegacyProtocol } from '../protocol/BitcoinLegacyProtocol'

type SupportedProtocols = MainProtocolSymbols.BTC | MainProtocolSymbols.BTC_SEGWIT | MainProtocolSymbols.BTC_TAPROOT

export class BitcoinModule implements AirGapModule<{ Protocols: SupportedProtocols; ProtocolNetwork: BitcoinProtocolNetwork }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration>

  public constructor() {
    const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
      supportedNetworks: [BITCOIN_MAINNET_PROTOCOL_NETWORK]
    })
    this.networkRegistries = {
      [MainProtocolSymbols.BTC]: networkRegistry,
      [MainProtocolSymbols.BTC_SEGWIT]: networkRegistry,
      [MainProtocolSymbols.BTC_TAPROOT]: networkRegistry
    }
    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: SupportedProtocols,
    networkOrId?: BitcoinProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.BITCOIN, 'Protocol network not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: SupportedProtocols,
    networkOrId?: BitcoinProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.BITCOIN, 'Block Explorer network not supported.')
    }

    return new BlockCypherBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new BitcoinV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.BTC:
        return createBitcoinLegacyProtocol({ network })
      case MainProtocolSymbols.BTC_SEGWIT:
        return createBitcoinSegwitProtocol({ network })
      case MainProtocolSymbols.BTC_TAPROOT:
        return createBitcoinTaprootProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.BITCOIN, `Protocol ${identifier} not supported.`)
    }
  }
}
