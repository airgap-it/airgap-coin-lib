import { AirGapModule, ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { OfflineProtocol, OnlineProtocol } from '@airgap/module-kit/protocol/protocol'

export class ERC20Module implements AirGapModule {
  // TODO: figure out what to do with modules that should create generic protocols instances

  public readonly supportedNetworks: Record<string, ProtocolNetwork> = {}

  public async createOfflineProtocol(): Promise<OfflineProtocol | undefined> {
    throw new Error('Method not implemented.')
  }

  public async createOnlineProtocol(networkId?: string | undefined): Promise<OnlineProtocol | undefined> {
    throw new Error('Method not implemented.')
  }

  public async createBlockExplorer(networkId?: string | undefined): Promise<BlockExplorer | undefined> {
    throw new Error('Method not implemented.')
  }
}
