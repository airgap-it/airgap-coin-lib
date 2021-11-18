import { ProtocolSymbols, SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFAProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

export class TezosCTez extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosCTezProtocolConfig())
  ) {
    super(options)
  }
}

export class TezosCTezProtocolConfig extends TezosFAProtocolConfig {
  constructor(
    symbol: string = 'ctez',
    name: string = 'CTez',
    marketSymbol: string = 'ctez',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_CTEZ,
    contractAddress: string = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.300',
      high: '0.500'
    },
    decimals: number = 6
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
