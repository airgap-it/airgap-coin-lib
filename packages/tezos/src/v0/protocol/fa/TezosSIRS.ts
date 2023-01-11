import { FeeDefaults, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFA2ProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

export class TezosSIRS extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosSIRSProtocolConfig())
  ) {
    super(options)
  }
}

export class TezosSIRSProtocolConfig extends TezosFA2ProtocolConfig {
  constructor(
    symbol: string = 'SIRS',
    name: string = 'Sirius',
    marketSymbol: string = 'SIRS',
    identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_SIRS,
    contractAddress: string = 'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo',
    feeDefaults: FeeDefaults = {
      low: '0.100',
      medium: '0.200',
      high: '0.300'
    },
    decimals: number = 0
  ) {
    super(contractAddress, identifier, symbol, name, marketSymbol, feeDefaults, decimals)
  }
}
