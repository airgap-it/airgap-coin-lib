import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapModule,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { AirGapProtocol, OfflineProtocol, OnlineProtocol } from '@airgap/module-kit/protocol/protocol'
import { CRYPTOID_TESTNET_URL, CryptoIDBlockExplorer } from '../block-explorer/CryptoIDBlockExplorer'
import {
  createGroestlcoinProtocol,
  GROESTLCOIN_MAINNET_PROTOCOL_NETWORK,
  GROESTLCOIN_TESTNET_PROTOCOL_NETWORK
} from '../protocol/GroestlcoinProtocol'
import { GroestlcoinV3SerializerCompanion } from '../serializer/v3/serializer-companion'

type SupportedProtocols = MainProtocolSymbols.GRS

export class GroestlcoinModule implements AirGapModule<{ Protocols: SupportedProtocols }> {
  private readonly networkRegistries: Record<SupportedProtocols, ModuleNetworkRegistry> = {
    [MainProtocolSymbols.GRS]: new ModuleNetworkRegistry({
      supportedNetworks: [GROESTLCOIN_MAINNET_PROTOCOL_NETWORK, GROESTLCOIN_TESTNET_PROTOCOL_NETWORK]
    })
  }
  public readonly supportedProtocols: Record<SupportedProtocols, ProtocolConfiguration> = createSupportedProtocols(this.networkRegistries)

  public async createOfflineProtocol(identifier: SupportedProtocols): Promise<OfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(identifier: SupportedProtocols, networkId?: string): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.GROESTLCOIN, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(identifier: SupportedProtocols, networkId?: string): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistries[identifier]?.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.GROESTLCOIN, 'Block Explorer network type not supported.')
    }

    if (network.type === 'testnet') {
      return new CryptoIDBlockExplorer(CRYPTOID_TESTNET_URL)
    } else {
      return new CryptoIDBlockExplorer()
    }
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new GroestlcoinV3SerializerCompanion()
  }

  private createProtocol(identifier: SupportedProtocols, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
      case MainProtocolSymbols.GRS:
        return createGroestlcoinProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.GROESTLCOIN, `Protocol ${identifier} not supported.`)
    }
  }
}
