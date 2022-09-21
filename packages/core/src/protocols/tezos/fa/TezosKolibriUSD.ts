import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFAProtocolOptions, TezosKolibriUSDProtocolConfig } from './TezosFAProtocolOptions'

export class TezosKolibriUSD extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosKolibriUSDProtocolConfig()
    )
  ) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    return this.contract.network.extras.indexerClient.getTokenBalances({ contractAddress: this.contract.address, id: 0 }, 10000)
  }
}
