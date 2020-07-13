import { ProtocolNetwork } from './ProtocolNetwork'

export interface ProtocolOptions<T = unknown> {
  network: ProtocolNetwork
  config: T
}
