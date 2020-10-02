import * as groestlcoinJSMessage from '../../dependencies/src/groestlcoinjs-message-2.1.0/index'

import { MainProtocolSymbols, ProtocolSymbols } from '../../utils/ProtocolSymbols'
import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'
import { BitcoinCryptoClient } from '../bitcoin/BitcoinCryptoClient'
import { CurrencyUnit, FeeDefaults } from '../ICoinProtocol'

import { GroestlcoinProtocolOptions } from './GroestlcoinProtocolOptions'

export class GroestlcoinProtocol extends BitcoinProtocol {
  public symbol: string = 'GRS'
  public name: string = 'Groestlcoin'
  public marketSymbol: string = 'grs'

  public feeSymbol: string = 'grs'

  public feeDefaults: FeeDefaults = {
    low: '0.00002',
    medium: '0.00004',
    high: '0.00005'
  }
  public decimals: number = 8
  public feeDecimals: number = 8
  public identifier: ProtocolSymbols = MainProtocolSymbols.GRS
  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'GRS',
      factor: '1'
    },
    {
      unitSymbol: 'mGRS',
      factor: '0.0001'
    },
    {
      unitSymbol: 'Satoshi',
      factor: '0.00000001'
    }
  ]

  public supportsHD: boolean = true

  public standardDerivationPath: string = `m/44'/17'/0'`
  public addressValidationPattern: string = '^([F3][a-km-zA-HJ-NP-Z1-9]{33}|grs1[a-zA-HJ-NP-Z0-9]{39})$'
  public addressPlaceholder: string = 'Fdb...'

  constructor(public readonly options: GroestlcoinProtocolOptions = new GroestlcoinProtocolOptions()) {
    super(options)
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    return new BitcoinCryptoClient(this, groestlcoinJSMessage).signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return new BitcoinCryptoClient(this, groestlcoinJSMessage).verifyMessage(message, signature, publicKey)
  }
}
