import { AirGapBlockExplorer } from '../block-explorer/AirGapBlockExplorer'
import { AirGapOfflineProtocol, AirGapOnlineProtocol } from '../protocol/AirGapProtocol'
import { ProtocolNetworkType } from '../types/protocol'

export interface AirGapModule {
  supportedNetworks: ProtocolNetworkType[]

  createOfflineProtocol(): Promise<AirGapOfflineProtocol | undefined>
  createOnlineProtocol(network: ProtocolNetworkType): Promise<AirGapOnlineProtocol | undefined>

  createBlockExplorer(network: ProtocolNetworkType): Promise<AirGapBlockExplorer | undefined>
}
