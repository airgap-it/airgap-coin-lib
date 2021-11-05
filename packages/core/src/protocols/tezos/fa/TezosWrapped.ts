import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosUtils } from '../TezosUtils'

import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFAProtocolOptions, TezosWrappedProtocolConfig } from './TezosFAProtocolOptions'

export class TezosWrapped extends TezosFA1p2Protocol {
  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosWrappedProtocolConfig()
    )
  ) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    const request = {
      bigMapID: 257
    }
    const values = await this.contract.conseilBigMapValues(request)

    return values
      .map((value) => {
        try {
          const address = TezosUtils.parseAddress(value.key)
          if (address === undefined || !value.value) {
            return {
              address: '',
              amount: '0'
            }
          }
          let amount = '0'

          amount = value.value

          return {
            address,
            amount
          }
        } catch {
          return {
            address: '',
            amount: '0'
          }
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
