import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { AirGapModule, ModuleNetworkRegistry, ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { OfflineProtocol, OnlineProtocol } from '@airgap/module-kit/protocol/protocol'

import { EtherscanBlockExplorer } from '../block-explorer/EtherscanBlockExplorer'
import { EthereumBaseProtocol } from '../protocol/EthereumBaseProtocol'

export abstract class EthereumBaseModule implements AirGapModule {
  public readonly supportedNetworks: Record<string, ProtocolNetwork>

  private readonly networkRegistry: ModuleNetworkRegistry

  protected constructor(supportedNetworks: ProtocolNetwork[], defaultNetwork?: ProtocolNetwork) {
    this.networkRegistry = new ModuleNetworkRegistry({ supportedNetworks, defaultNetwork })
    this.supportedNetworks = this.networkRegistry.supportedNetworks
  }

  public abstract createEthereumProtocol(network?: ProtocolNetwork): EthereumBaseProtocol

  public async createOfflineProtocol(): Promise<OfflineProtocol | undefined> {
    return this.createEthereumProtocol()
  }

  public async createOnlineProtocol(networkId?: string | undefined): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'Protocol network type not supported.')
    }

    return this.createEthereumProtocol(network)
  }

  public async createBlockExplorer(networkId?: string | undefined): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.ETHEREUM, 'Block Explorer network type not supported.')
    }

    return new EtherscanBlockExplorer()
  }
}
