import createHash = require('../dependencies/src/create-hash-1.2.0/index')

import { ProtocolBlockExplorer } from './ProtocolBlockExplorer'

const sha256hashShort: (input: string) => string = (input: string): string => {
  const hash = createHash('sha256')
  hash.update(input)

  return hash.digest('base64').slice(0, 10)
}

export enum NetworkType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  CUSTOM = 'CUSTOM'
}

export abstract class ProtocolNetwork<T = unknown> {
  get identifier(): string {
    const hashed: string = sha256hashShort(`${this.name}-${this.rpcUrl}`)

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
