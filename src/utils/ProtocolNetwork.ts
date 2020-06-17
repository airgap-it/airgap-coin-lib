import { ProtocolBlockExplorer } from './ProtocolBlockExplorer'

export enum NetworkType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  CUSTOM = 'CUSTOM'
}

export interface ProtocolNetwork<T = unknown> {
  name: string
  type: NetworkType
  rpcUrl: string
  blockExplorer: ProtocolBlockExplorer
  extras: T
}
