import { MainProtocolSymbols, ProtocolSymbols } from '../../utils/ProtocolSymbols'
import { BitcoinBlockbookProtocol } from '../bitcoin/BitcoinBlockbookProtocol'
import { CurrencyUnit, FeeDefaults } from '../ICoinProtocol'

import { GroestlcoinProtocolOptions } from './GroestlcoinProtocolOptions'

export class GroestlcoinProtocol extends BitcoinBlockbookProtocol {
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
}
