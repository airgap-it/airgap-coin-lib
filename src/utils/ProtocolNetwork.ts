import { ProtocolBlockExplorer } from './ProtocolBlockExplorer'

export enum NetworkType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  CUSTOM = 'CUSTOM'
}

const hash: (str: string) => string = (str: string): string => {
  return str // TODO: Hash
}

export abstract class ProtocolNetwork<T = unknown> {
  get identifier(): string {
    const hashed: string = hash(`${this.name}-${this.rpcUrl}`)

    return `${this.type}-${hashed}`
  }

  constructor(
    public readonly name: string,
    public readonly type: NetworkType,
    public readonly rpcUrl: string,
    public readonly blockExplorer: ProtocolBlockExplorer,
    public readonly extras: T
  ) {}
}
