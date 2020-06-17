import { CurrencyUnit, FeeDefaults } from '../../ICoinProtocol'
import { SubstrateProtocol } from '../SubstrateProtocol'
import { SubstrateProtocolOptions } from '../SubstrateProtocolOptions'

import { KusamaProtocolOptions } from './KusamaProtocolOptions'

export class KusamaProtocol extends SubstrateProtocol {
  public symbol: string = 'KSM'
  public name: string = 'Kusama'
  public marketSymbol: string = 'KSM'
  public feeSymbol: string = 'KSM'

  public decimals: number = 12
  public feeDecimals: number = 12
  public identifier: string = 'kusama'

  public feeDefaults: FeeDefaults = {
    low: '0.001', // 1 000 000 000
    medium: '0.001',
    high: '0.001'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'KSM',
      factor: '1'
    },
    {
      unitSymbol: 'mKSM',
      factor: '0.001'
    },
    {
      unitSymbol: 'uKSM',
      factor: '0.000001'
    },
    {
      unitSymbol: 'Point',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'Planck',
      factor: '0.000000000001'
    }
  ]

  public standardDerivationPath: string = `m/44'/434'/0'/0/0` // TODO: verify

  public constructor(public readonly options: SubstrateProtocolOptions = new KusamaProtocolOptions()) {
    super(options)
  }
}
