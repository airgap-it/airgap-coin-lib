import { TezosProtocolNetwork } from '../TezosProtocolOptions'
import { TezosUtils } from '../TezosUtils'

import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosFAProtocolOptions, TezosUSDProtocolConfig } from './TezosFAProtocolOptions'

export class TezosUSD extends TezosFAProtocol {

  private static extractAmountRegex = /Pair ([0-9]+) /

  constructor(
    public readonly options: TezosFAProtocolOptions = new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosUSDProtocolConfig())
  ) {
    super(options)
  }

  public async fetchTokenHolders(): Promise<{ address: string, amount: string }[]> {
    const values = await this.contract.bigMapValues([])
    return values.map((value) => {
      try {
        const address = TezosUtils.parseAddress(value.key)
        if (address === undefined || !value.value) {
          return {
            address: '',
            amount: '0'
          }
        }
        let amount = '0'
        // unfortunately, conseil returns the big map value as a parsed Michelson instead of the Micheline JSON
        // so we need to extract the amount using this regex instead of parsing it as a JSON.
        const match = TezosUSD.extractAmountRegex.exec(value.value as string)
        if (match) {
          amount = match[1]
        }
        return {
          address: address,
          amount
        }
      } catch {
        return {
          address: '',
          amount: '0'
        }
      }
    }).filter((value) => value.amount !== '0')
  }
}
