import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosUtils } from '../TezosUtils'

import { TezosFA1p2Protocol } from './TezosFA1p2Protocol'
import { TezosFAProtocolOptions, TezosKolibriUSDProtocolConfig } from './TezosFAProtocolOptions'

export class TezosKolibriUSD extends TezosFA1p2Protocol {
  private static readonly extractValueRegex = /}\s([0-9]+)$/

  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(
      new TezosProtocolNetwork(),
      new TezosKolibriUSDProtocolConfig()
    )
  ) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    const request = {
      bigMapID: 380
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

          const match = TezosKolibriUSD.extractValueRegex.exec(value.value)
          if (match) {
            amount = match[1]
          }

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
