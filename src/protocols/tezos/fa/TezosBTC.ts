import { TezosContractEntity } from '../contract/TezosContractEntity'
import { TezosContractPair } from '../contract/TezosContractPair'
import { TezosContractInt } from '../contract/TezosContractInt'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { TezosBTCDetails } from './../../../serializer/constants'
import { TezosFAProtocol } from './TezosFAProtocol'

export class TezosBTC extends TezosFAProtocol {
  private static readonly bigMapKeyLedgerPrefix = '0x05070701000000066c65646765720a00000016'

  constructor(
    contractAddress: string = TezosBTCDetails.CONTRACT_ADDRESS,
    jsonRPCAPI?: string,
    baseApiUrl?: string,
    baseApiKey?: string,
    baseApiNetwork?: string,
    network?: TezosNetwork
  ) {
    super({
      symbol: 'tzBTC',
      name: 'Tezos BTC',
      marketSymbol: 'btc',
      identifier: 'xtz-btc',
      feeDefaults: {
        low: '0.100',
        medium: '0.200',
        high: '0.300'
      },
      decimals: 8,
      contractAddress,
      jsonRPCAPI,
      baseApiUrl,
      baseApiKey,
      baseApiNetwork,
      network
    })
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    const values = await this.contract.bigMapValues([
      {
        field: 'key' as const,
        operation: 'startsWith' as const,
        set: [TezosBTC.bigMapKeyLedgerPrefix]
      }
    ])

    return values
      .map((bigMapEntry) => {
        const addressHex = bigMapEntry.key.substring(TezosBTC.bigMapKeyLedgerPrefix.length)
        const address = TezosUtils.parseAddress(addressHex)
        let value: TezosContractEntity = new TezosContractInt(0)
        try {
          if (bigMapEntry.value) {
            value = TezosUtils.parseHex(bigMapEntry.value)
          }
        } catch {}
        if (value instanceof TezosContractPair) {
          value = value.first
        }

        return {
          address,
          amount: new BigNumber((value as TezosContractInt).value).toFixed()
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
