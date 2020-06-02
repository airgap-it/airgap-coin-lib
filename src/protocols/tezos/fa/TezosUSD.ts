import { TezosBTCDetails } from './../../../serializer/constants'
import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'

export class TezosUSD extends TezosFAProtocol {
  constructor(
    contractAddress: string = TezosBTCDetails.CONTRACT_ADDRESS,
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

  public async fetchTokenHolders(): Promise<{address: string, amount: string}[]> {
    const values = await this.contract.bigMapValues([])
    return values.map((value) => {
      return {
        address: TezosUtils.parseAddress(value.key.substring(2)),
        amount: value.value ? this.bigMapValueToBalance(value.value) : '0'
      }
    }).filter((value) => value.amount !== '0')
  }

  private bigMapValueToBalance(value: string): string {
    const firstSpaceIndex = value.indexOf(' ')
    if (firstSpaceIndex === -1) {
      throw Error('Cannot parse balance')
    }
    let balance = value.slice(firstSpaceIndex + 1)
    const secondSpaceIndex = balance.indexOf(' ')
    if (secondSpaceIndex === -1) {
      throw Error('Cannot parse balance')
    }
    balance = balance.slice(0, secondSpaceIndex)
    return `${parseInt(balance)}`
  }
}
