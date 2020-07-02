import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonType } from '../types/michelson/MichelsonType'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'

import { TezosBTCDetails } from './../../../serializer/constants'
import { TezosFA12Protocol } from './TezosFA12Protocol'

export class TezosBTC extends TezosFA12Protocol {
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
    const values = await this.contract.bigMapValues({
      predicates: [
        {
          field: 'key',
          operation: 'startsWith',
          set: [TezosBTC.bigMapKeyLedgerPrefix]
        }
      ]
    })

    return values
      .map((bigMapEntry) => {
        const addressHex = bigMapEntry.key.substring(TezosBTC.bigMapKeyLedgerPrefix.length)
        const address = TezosUtils.parseAddress(addressHex)
        let value: MichelsonType = MichelsonInt.from(0)
        try {
          if (bigMapEntry.value) {
            value = TezosUtils.parseHex(bigMapEntry.value)
          }
        } catch {}

        if (value instanceof MichelsonPair) {
          value = value.first.get()
        }

        const amount: BigNumber = value instanceof MichelsonInt
          ? value.value
          : new BigNumber(0) 

        return {
          address,
          amount: amount.toFixed()
        }
      })
      .filter((value) => value.amount !== '0')
  }
}
