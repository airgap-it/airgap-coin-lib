import { CurrencyUnit, FeeDefaults } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { SubstrateDelegateProtocol } from '@airgap/substrate/v0/protocol/SubstrateDelegateProtocol'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'
import { SubstrateProtocolOptions } from '@airgap/substrate/v0/protocol/SubstrateProtocolOptions'

import { AstarProtocolOptions } from './AstarProtocolOptions'

export class AstarProtocol extends SubstrateDelegateProtocol<SubstrateNetwork.ASTAR> {
  public symbol: string = 'ASTR'
  public name: string = 'Astar'
  public marketSymbol: string = 'ASTR'
  public feeSymbol: string = 'ASTR'

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: ProtocolSymbols = MainProtocolSymbols.ASTAR

  public feeDefaults: FeeDefaults = {
    low: '0.001',
    medium: '0.001',
    high: '0.001'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'ASTR',
      factor: '1'
    },
    {
      unitSymbol: 'mASTR',
      factor: '0.001'
    },
    {
      unitSymbol: 'uASTR',
      factor: '0.000001'
    },
    {
      unitSymbol: 'nASTR',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'pASTR',
      factor: '0.000000000001'
    },
    {
      unitSymbol: 'fASTR',
      factor: '0.000000000000001'
    },
    {
      unitSymbol: 'aASTR',
      factor: '0.000000000000000001'
    }
  ]

  public standardDerivationPath: string = `m/44'/810'/0'/0/0`

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^[a-km-zA-HJ-NP-Z1-9]+$'
  public addressPlaceholder: string = `ABC...`

  public constructor(public readonly options: SubstrateProtocolOptions<SubstrateNetwork.ASTAR> = new AstarProtocolOptions()) {
    super(options)
  }
}
