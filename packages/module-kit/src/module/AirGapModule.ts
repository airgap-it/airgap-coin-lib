import { AirGapBlockExplorer } from '../block-explorer/AirGapBlockExplorer'
import { AirGapOfflineProtocol, AirGapOnlineProtocol } from '../protocol/AirGapProtocol'
import { ProtocolNetworkType } from '../types/protocol'

export interface AirGapModule {
  createOfflineProtocol(): AirGapOfflineProtocol | undefined
  createOnlineProtocol(network: ProtocolNetworkType): AirGapOnlineProtocol | undefined

  createBlockExplorer(network: ProtocolNetworkType): AirGapBlockExplorer | undefined
}
