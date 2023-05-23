// tslint:disable: max-classes-per-file
import createHash = require('@airgap/coinlib-core/dependencies/src/create-hash-1.2.0/index')
import { CryptoConfiguration, ProtocolMetadata, ProtocolNetwork, ProtocolNetworkType } from '@airgap/module-kit'

const sha256hashShort: (input: string) => string = (input: string): string => {
  const hash = createHash('sha256')
  hash.update(input)

  return hash.digest('base64').slice(0, 10)
}

export class MockProtocolNetwork implements ProtocolNetwork {
  public get identifier(): string {
    const hashed: string = sha256hashShort(`${this.name}-${this.rpcUrl}`)

    return `${this.type}-${hashed}`
  }

  constructor(
    public name: string = 'mainnet',
    public type: ProtocolNetworkType = 'mainnet',
    public rpcUrl: string = '',
    public blockExplorerUrl: string = ''
  ) {}
}

export class MockProtocolOptions {
  constructor(
    public readonly network: ProtocolNetwork = new MockProtocolNetwork(),
    public readonly config: {
      name?: string
      identifier?: string
      units?: ProtocolMetadata<string>['units']
      mainUnit?: string
      fee?: ProtocolMetadata<string>['fee']
      standardDerivationPath?: string
      crypto?: CryptoConfiguration
    } = {}
  ) {}
}
