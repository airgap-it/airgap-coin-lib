import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFAProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

export class TezosPlenty extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosPlentyProtocolConfig()
    )
  ) {
    super(options)
  }
}

export class TezosPlentyProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'PLENTY',
    name: string = 'Plenty DAO',
    marketSymbol: string = 'PLENTY',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_PLENTY,
    contractAddress: string = 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.300',
      high: '0.500'
    },
    decimals: number = 18
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
