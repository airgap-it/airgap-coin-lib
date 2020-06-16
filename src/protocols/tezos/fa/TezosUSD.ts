import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'

export class TezosUSD extends TezosFAProtocol {

  private static extractAmountRegex = /Pair ([0-9]+) /

  constructor(
    contractAddress: string = "KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9",
    jsonRPCAPI?: string,
    baseApiUrl?: string,
    baseApiKey?: string,
    baseApiNetwork?: string,
    network?: TezosNetwork
  ) {
    super({
      symbol: 'USDtz',
      name: 'USD Tez',
      marketSymbol: 'USDtz',
      identifier: 'xtz-usd',
      feeDefaults: {
        low: '0.100',
        medium: '0.200',
        high: '0.300'
      },
      decimals: 8,
      contractAddress: contractAddress,
      jsonRPCAPI: jsonRPCAPI,
      baseApiUrl: baseApiUrl,
      baseApiKey: baseApiKey,
      baseApiNetwork: baseApiNetwork,
      network: network
    })
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
