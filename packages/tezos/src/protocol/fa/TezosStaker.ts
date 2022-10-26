import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1Protocol } from './TezosFA1Protocol'
import { TezosFAProtocolOptions, TezosStakerProtocolConfig } from './TezosFAProtocolOptions'

export class TezosStaker extends TezosFA1Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosStakerProtocolConfig()
    )
  ) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    return this.contract.network.extras.indexerClient.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}
