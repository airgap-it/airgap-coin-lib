import { MainProtocolSymbols, ProtocolSymbols } from '../../../../utils/ProtocolSymbols'
import { CurrencyUnit } from '../../../ICoinProtocol'
import { SubstrateNetwork } from '../../SubstrateNetwork'
import { SubstrateProtocolOptions } from '../../SubstrateProtocolOptions'
import { AstarProtocol } from '../AstarProtocol'
import { AstarProtocolOptions } from '../AstarProtocolOptions'

export class ShidenProtocol extends AstarProtocol {
  public symbol: string = 'SDN'
  public name: string = 'Shiden'
  public marketSymbol: string = 'SDN'
  public feeSymbol: string = 'SDN'

  public identifier: ProtocolSymbols = MainProtocolSymbols.SHIDEN

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'SDN',
      factor: '1'
    },
    {
      unitSymbol: 'mSDN',
      factor: '0.001'
    },
    {
      unitSymbol: 'uSDN',
      factor: '0.000001'
    },
    {
      unitSymbol: 'nSDN',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'pSDN',
      factor: '0.000000000001'
    },
    {
      unitSymbol: 'fSDN',
      factor: '0.000000000000001'
    },
    {
      unitSymbol: 'aSDN',
      factor: '0.000000000000000001'
    }
  ]

  public standardDerivationPath: string = `m/44'/810'/0'/0/0`

  public addressValidationPattern: string = '^[a-km-zA-HJ-NP-Z1-9]+$'
  public addressPlaceholder: string = `ABC...`

  public constructor(public readonly options: SubstrateProtocolOptions<SubstrateNetwork.ASTAR> = new AstarProtocolOptions()) {
    super(options)
  }
}
