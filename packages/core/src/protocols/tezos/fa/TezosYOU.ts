import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolOptions, TezosYOUProtocolConfig } from './TezosFAProtocolOptions'

export class TezosYOU extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(new TezosProtocolNetwork(), new TezosYOUProtocolConfig())
  ) {
    super(options)
  }
}
