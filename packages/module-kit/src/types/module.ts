import { ProtocolNetwork } from './protocol'

export interface OfflineProtocolConfiguration {
  type: 'offline'
}

export interface OnlineProtocolConfiguration {
  type: 'online'
  networks: Record<string, ProtocolNetwork>
}

export interface FullProtocolConfiguration {
  type: 'full'
  offline: OfflineProtocolConfiguration
  online: OnlineProtocolConfiguration
}

export type ProtocolConfiguration = OfflineProtocolConfiguration | OnlineProtocolConfiguration | FullProtocolConfiguration
