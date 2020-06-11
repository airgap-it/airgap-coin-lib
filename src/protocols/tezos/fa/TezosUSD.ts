import { TezosBTCDetails } from './../../../serializer/constants'
import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { TezosContractBytes } from '../contract/TezosContractBytes'
import { TezosContractPair } from '../contract/TezosContractPair'
import { TezosContractInt } from '../contract/TezosContractInt'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

export class TezosUSD extends TezosFAProtocol {

  private static bigMapKeyLedgerPrefix = "0x05070701000000066c65646765720a00000016"

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
    const values = await this.contract.bigMapValues([{
      field: 'key' as const,
      operation: "startsWith" as const,
      set: [TezosUSD.bigMapKeyLedgerPrefix]
    }])
    return values.map((value) => {
      if (!value.value) {
        
      }
      const address = (TezosUtils.parseHex(value.key) as TezosContractPair).second as TezosContractBytes
      if (address === undefined) {
        return {
          address: '',
          amount: '0'
        }
      }
      const amount = (TezosUtils.parseHex(value.value as string) as TezosContractPair).first as TezosContractInt
      return {
        address: TezosUtils.parseAddress(address.value),
        amount: new BigNumber(amount.value).toFixed()
      }
    }).filter((value) => value.amount !== '0')
  }
}
