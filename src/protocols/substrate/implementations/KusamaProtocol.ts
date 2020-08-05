import { MainProtocolSymbols, ProtocolSymbols } from '../../../utils/ProtocolSymbols'
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
  public identifier: ProtocolSymbols = MainProtocolSymbols.KUSAMA

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

  public standardDerivationPath: string = `m/44'/434'/0'/0/0`

  public addressValidationPattern: string = '^[C-HJ][a-km-zA-HJ-NP-Z1-9]+$'
  public addressPlaceholder: string = `C/D/E/F/G/H/J...` // TODO: set better placeholder?

  protected defaultValidator: string = 'GcqKn3HHodwcFc3Pg3Evcbc43m7qJNMiMv744e5WMSS7TGn'

  public constructor(public readonly options: SubstrateProtocolOptions = new KusamaProtocolOptions()) {
    super(options)
  }
}
