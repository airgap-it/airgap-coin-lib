import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { AirGapModule, ModuleNetworkRegistry, ProtocolNetwork } from '@airgap/module-kit'
import { AirGapBlockExplorer, BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { OfflineProtocol, OnlineProtocol } from '@airgap/module-kit/protocol/protocol'
import { AstarBaseProtocol } from '../protocol/AstarBaseProtocol'

export abstract class AstarBaseModule implements AirGapModule {
  protected abstract readonly name: string

  public readonly supportedNetworks: Record<string, ProtocolNetwork>
  private readonly networkRegistry: ModuleNetworkRegistry

  protected constructor(supportedNetworks: ProtocolNetwork[], defaultNetwork?: ProtocolNetwork) {
    this.networkRegistry = new ModuleNetworkRegistry({ supportedNetworks, defaultNetwork })
    this.supportedNetworks = this.networkRegistry.supportedNetworks
  }

  public abstract createAstarProtocol(network?: ProtocolNetwork): AstarBaseProtocol
  public abstract createAstarBlockExplorer(network: ProtocolNetwork): AirGapBlockExplorer

  public async createOfflineProtocol(): Promise<OfflineProtocol | undefined> {
    return this.createAstarProtocol()
  }

  public async createOnlineProtocol(networkId?: string | undefined): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Protocol network type not supported. (${this.name})`)
    }

    return this.createAstarProtocol(network)
  }

  public async createBlockExplorer(networkId?: string | undefined): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network?.type !== 'mainnet') {
      throw new ConditionViolationError(Domain.SUBSTRATE, `Block Explorer network type not supported. (${this.name})`)
    }

    return this.createAstarBlockExplorer(network)
  }
}
