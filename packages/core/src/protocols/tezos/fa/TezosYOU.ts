import { TezosProtocolNetwork } from '../TezosProtocolOptions'
// import { TezosUtils } from '../TezosUtils'

import { TezosFA2Protocol } from './TezosFA2Protocol'
import { TezosFA2ProtocolOptions, TezosYOUProtocolConfig } from './TezosFAProtocolOptions'

export class TezosYOU extends TezosFA2Protocol {
  // private static readonly extractAmountRegex = /Pair ([0-9]+) /

  constructor(
    public readonly options: TezosFA2ProtocolOptions = new TezosFA2ProtocolOptions(new TezosProtocolNetwork(), new TezosYOUProtocolConfig())
  ) {
    super(options)
  }

  public async fetchTokenHolders(_tokenIDs: number[]): Promise<{ address: string; amount: string; tokenID: number }[]> {
    return []

    // const request = {
    //   bigMapID: 7715
    // }
    // const values = await this.contract.bigMapValues(request)

    // return values
    //   .map((value) => {
    //     try {
    //       const address = TezosUtils.parseAddress(value.key)
    //       if (address === undefined || !value.value) {
    //         return {
    //           address: '',
    //           amount: '0'
    //         }
    //       }
    //       let amount = '0'

    //       const match = TezosYOU.extractAmountRegex.exec(value.value)
    //       if (match) {
    //         amount = match[1]
    //       }

    //       return {
    //         address,
    //         amount
    //       }
    //     } catch {
    //       return {
    //         address: '',
    //         amount: '0'
    //       }
    //     }
    //   })
    //   .filter((value) => value.amount !== '0')
  }
}
