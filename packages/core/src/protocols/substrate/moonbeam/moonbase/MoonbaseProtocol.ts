import { MoonbeamProtocol } from '../MoonbeamProtocol'
import { MainProtocolSymbols, ProtocolSymbols } from '../../../../utils/ProtocolSymbols'
import { CurrencyUnit, FeeDefaults } from '../../../ICoinProtocol'
import { MoonbaseProtocolOptions } from './MoonbaseProtocolOptions'

export class MoonbaseProtocol extends MoonbeamProtocol {
  public symbol: string = 'DEV'
  public name: string = 'Moonbase'
  public marketSymbol: string = 'DEV'
  public feeSymbol: string = 'DEV'

  public decimals: number = 18
  public feeDecimals: number = 18

  public identifier: ProtocolSymbols = MainProtocolSymbols.MOONBASE
  public addressIsCaseSensitive: boolean = false

  public feeDefaults: FeeDefaults = {
    low: '0.000000000125',
    medium: '0.000000000125',
    high: '0.000000000125'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'DEV',
      factor: '1'
    },
    {
      unitSymbol: 'mDEV',
      factor: '0.001'
    },
    {
      unitSymbol: 'uDEV',
      factor: '0.000001'
    },
    {
      unitSymbol: 'nDEV',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'pDEV',
      factor: '0.000000000001'
    },
    {
      unitSymbol: 'fDEV',
      factor: '0.000000000000001'
    },
    {
      unitSymbol: 'aDEV',
      factor: '0.000000000000000001'
    }
  ]

  public constructor(public readonly options: MoonbaseProtocolOptions = new MoonbaseProtocolOptions()) {
    super(options)
  }
}
