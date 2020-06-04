import { TezosBTCDetails } from './../../../serializer/constants'
import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { TezosContractEntity } from '../contract/TezosContractEntity'
import { TezosContractPair } from '../contract/TezosContractPair'

export class TezosBTC extends TezosFAProtocol {

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
      symbol: 'TZBTC',
      name: 'Tezos BTC',
      marketSymbol: 'btc',
      identifier: 'xtz-btc',
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
      set: [TezosBTC.bigMapKeyLedgerPrefix]
    }])
    return values.map((bigMapEntry) => {
      const addressHex = bigMapEntry.key.substring(TezosBTC.bigMapKeyLedgerPrefix.length)
      const address = TezosUtils.parseAddress(addressHex)
      let value: number | string | TezosContractEntity = '0'
      try {
        value = bigMapEntry.value ? TezosUtils.parseHex(bigMapEntry.value) : '0'
      } catch {}
      if (value instanceof TezosContractPair) {
        value = value.first
      }
      return {
        address: address,
        amount: (value as number).toString()
      }
    }).filter((value) => value.amount !== '0')
  }
}
