import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFAProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

export class TezosDOGA extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosDOGAProtocolConfig())
  ) {
    super(options)
  }
}

export class TezosDOGAProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'DOGA',
    name: string = 'DOGAMI',
    marketSymbol: string = 'DOGA',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_DOGA,
    contractAddress: string = 'KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.300',
      high: '0.500'
    },
    decimals: number = 5
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
