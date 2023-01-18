import { CryptoClient, NetworkType, ProtocolBlockExplorer, ProtocolNetwork } from '../../../src'
import { CurrencyUnit, FeeDefaults } from '../../../src/protocols/ICoinProtocol'
import { ProtocolOptions } from '../../../src/utils/ProtocolOptions'
import { ProtocolSymbols } from '../../../src/utils/ProtocolSymbols'

export class MockProtocolBlockExplorer extends ProtocolBlockExplorer {
  public async getAddressLink(address: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
  public async getTransactionLink(transactionId: string): Promise<string> {
    throw new Error('Method not implemented.')
  }
}

export class MockProtocolNetwork extends ProtocolNetwork {
  constructor(
    name: string = 'mainnet',
    type: NetworkType = NetworkType.MAINNET,
    rpcUrl: string = '',
    blockExplorer: ProtocolBlockExplorer = new MockProtocolBlockExplorer(''),
    extras: any = {}
  ) {
    super(name, type, rpcUrl, blockExplorer, extras)
  }
}

export class MockProtocolOptions implements ProtocolOptions {
  constructor(
    public readonly network: ProtocolNetwork = new MockProtocolNetwork(),
    public readonly config: {
      symbol?: string
      name?: string
      marketSymbol?: string
      feeSymbol?: string
      feeDefaults?: FeeDefaults
      decimals?: number
      feeDecimals?: number
      identifier?: ProtocolSymbols
      units?: CurrencyUnit[]
      supportsHD?: boolean
      standardDerivationPath?: string
      addressIsCaseSensitive?: boolean
      addressValidationPattern?: string
      addressPlaceholder?: string
      cryptoClient?: CryptoClient
      options?: ProtocolOptions
    } = {}
  ) {}
}
