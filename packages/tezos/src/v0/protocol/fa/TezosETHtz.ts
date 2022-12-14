import { TezosProtocolNetwork } from '../TezosProtocolOptions'

import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosETHtzProtocolConfig, TezosFAProtocolOptions } from './TezosFAProtocolOptions'

export class TezosETHtz extends TezosFA1p2Protocol {
  constructor(options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosETHtzProtocolConfig())) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    return this.contract.network.extras.indexerClient.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}
