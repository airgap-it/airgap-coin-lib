import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolOptions, TezosUUSDProtocolConfig } from './TezosFAProtocolOptions'

export class TezosUUSD extends TezosFA2Protocol {
  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosUUSDProtocolConfig()
    )
  ) {
    super(options)
  }
}
