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
import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'

import { StellarBlockExplorer } from '../block-explorer/StellarBlockExplorer'
import { createStellarProtocol, STELLAR_MAINNET_PROTOCOL_NETWORK } from '../protocol/StellarProtocol'
import { StellarV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { StellarAssetMetadata, StellarProtocolNetwork } from '../types/protocol'
import { stellarAssets, stellarAssetsIdentifiers } from './StellarAssets'
import { createStellarAssetProtocol } from '../protocol/stellarAssets/StellarAsset'

export class StellarModule implements AirGapModule<{ ProtocolNetwork: StellarProtocolNetwork }> {
  private readonly networkRegistries: Record<string, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<string, ProtocolConfiguration>

  public constructor() {
    const stellarNetworkRegistry: ModuleNetworkRegistry<StellarProtocolNetwork> = new ModuleNetworkRegistry({
      supportedNetworks: [STELLAR_MAINNET_PROTOCOL_NETWORK]
    })

    this.networkRegistries = {
      [MainProtocolSymbols.STELLAR]: stellarNetworkRegistry,
      ...stellarAssetsIdentifiers.reduce(
        (obj: Record<string, ModuleNetworkRegistry>, next: string) => Object.assign(obj, { [next]: stellarNetworkRegistry }),
        {}
      )
    }

    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: string,
    networkOrId?: StellarProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.STELLAR, 'Protocol network not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: string,
    networkOrId?: StellarProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.STELLAR, 'Block Explorer network not supported.')
    }

    return new StellarBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new StellarV3SerializerCompanion()
  }

  private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
    if (identifier === MainProtocolSymbols.STELLAR) {
      return createStellarProtocol({ network })
    }

    if (stellarAssets[identifier] !== undefined) {
      const tokenMetadata: StellarAssetMetadata = stellarAssets[identifier]

      return createStellarAssetProtocol(tokenMetadata)
    }

    throw new ConditionViolationError(Domain.SERIALIZER, `Protocol ${identifier} not supported.`)
  }
}
