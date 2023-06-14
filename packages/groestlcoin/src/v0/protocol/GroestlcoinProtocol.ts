import { BitcoinCryptoClient, BitcoinProtocol } from '@airgap/bitcoin/v0'
import { FeeDefaults } from '@airgap/coinlib-core'
// @ts-ignore
import * as groestlcoinJSMessage from '@airgap/coinlib-core/dependencies/src/groestlcoinjs-message-2.1.0/index'
import { CurrencyUnit } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

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

  public readonly cryptoClient: BitcoinCryptoClient

  constructor(public readonly options: GroestlcoinProtocolOptions = new GroestlcoinProtocolOptions()) {
    super(options)
    this.cryptoClient = new BitcoinCryptoClient(this, groestlcoinJSMessage)
  }
}
