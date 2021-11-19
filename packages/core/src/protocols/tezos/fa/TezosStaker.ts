import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosUtils } from '../TezosUtils'

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
    const values = await this.contract.conseilBigMapValues()

    return values
      .map((value) => {
        return {
          address: TezosUtils.parseAddress(value.key.substring(2)),
          amount: value.value !== null ? value.value : '0'
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
