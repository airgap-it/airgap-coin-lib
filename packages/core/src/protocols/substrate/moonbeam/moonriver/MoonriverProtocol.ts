import { MainProtocolSymbols, ProtocolSymbols } from '../../../../utils/ProtocolSymbols'
import { CurrencyUnit, FeeDefaults } from '../../../ICoinProtocol'
import { MoonbeamProtocol } from '../MoonbeamProtocol'
import { MoonriverProtocolOptions } from './MoonriverProtocolOptions'

export class MoonriverProtocol extends MoonbeamProtocol {
  public symbol: string = 'MOVR'
  public name: string = 'Moonriver'
  public marketSymbol: string = 'MOVR'
  public feeSymbol: string = 'MOVR'

  public decimals: number = 18
  public feeDecimals: number = 18

  public identifier: ProtocolSymbols = MainProtocolSymbols.MOONRIVER
  public addressIsCaseSensitive: boolean = false

  public feeDefaults: FeeDefaults = {
    low: '0.000000000125',
    medium: '0.000000000125',
    high: '0.000000000125'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'MOVR',
      factor: '1'
    },
    {
      unitSymbol: 'mMOVR',
      factor: '0.001'
    },
    {
      unitSymbol: 'uMOVR',
      factor: '0.000001'
    },
    {
      unitSymbol: 'GWEI',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'MWEI',
      factor: '0.000000000001'
    },
    {
      unitSymbol: 'kWEI',
      factor: '0.000000000000001'
    },
    {
      unitSymbol: 'WEI',
      factor: '0.000000000000000001'
    }
  ]

  public constructor(public readonly options: MoonriverProtocolOptions = new MoonriverProtocolOptions()) {
    super(options)
  }
}
