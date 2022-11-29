import { AirGapBlockExplorer } from '../block-explorer/AirGapBlockExplorer'
import { AirGapOfflineProtocol, AirGapOnlineProtocol } from '../protocol/AirGapProtocol'
import { ProtocolNetwork } from '../types/protocol'

export interface AirGapModule {
  supportedNetworks: Record<string, ProtocolNetwork>

  createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined>
  createOnlineProtocol(networkId?: string): Promise<AirGapOnlineProtocol | undefined>

  createBlockExplorer(networkId?: string): Promise<AirGapBlockExplorer | undefined>
}
