import { BlockExplorer } from '../block-explorer/block-explorer'
import { OfflineProtocol, OnlineProtocol } from '../protocol/protocol'
import { AirGapInterface } from '../types/airgap'
import { ProtocolNetwork } from '../types/protocol'

export interface Module {
  supportedNetworks: Record<string, ProtocolNetwork>

  createOfflineProtocol(): Promise<OfflineProtocol | undefined>
  createOnlineProtocol(networkId?: string): Promise<OnlineProtocol | undefined>

  createBlockExplorer(networkId?: string): Promise<BlockExplorer | undefined>
}

// Convinience Types

export type AirGapModule = AirGapInterface<Module>
