import { CurrencyUnit, FeeDefaults } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { SubstrateDelegateProtocol } from '@airgap/substrate/v0/protocol/SubstrateDelegateProtocol'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'
import { SubstrateProtocolOptions } from '@airgap/substrate/v0/protocol/SubstrateProtocolOptions'

import { KusamaProtocolOptions } from './KusamaProtocolOptions'

export class KusamaProtocol extends SubstrateDelegateProtocol<SubstrateNetwork.KUSAMA> {
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

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^[C-HJ][a-km-zA-HJ-NP-Z1-9]+$'
  public addressPlaceholder: string = `C/D/E/F/G/H/J...`

  public constructor(public readonly options: SubstrateProtocolOptions<SubstrateNetwork.KUSAMA> = new KusamaProtocolOptions()) {
    super(options)
  }
}
