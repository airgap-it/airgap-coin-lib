import Axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { ProtocolSymbols } from '../../utils/ProtocolSymbols'

import { TransactionListQuery } from './CosmosTransactionListQuery'

interface Shards {
  total: number
  successful: number
  failed: number
}

interface Amount {
  denom: string
  amount: string
}

interface MsgTypeValue {
  from_address: string
  to_address: string
  amount: Amount[]
}

interface Msg {
  type: string
  value: MsgTypeValue
}

interface Fee {
  amount: Amount[]
  gas: string
}

interface PubKey {
  type: string
  value: string
}

interface Signature {
  pub_key: PubKey
  signature: string
}

interface Value {
  msg: Msg[]
  fee: Fee
  signatures: Signature[]
  memo: string
}

interface Tx {
  type: string
  value: Value
}

interface Log {
  msg_index: string
  success: boolean
  log: string
}

interface Tag {
  key: string
  value: string
}

interface Result {
  gas_wanted: number
  gas_used: number
  log: Log[]
  tags: Tag[]
}

interface Source {
  hash: string
  height: number
  timestamp: string
  tx: Tx
  result: Result
}

interface Hit {
  _index: string
  _type: string
  _id: string
  _score: number
  _source: Source
}

interface Hits {
  total: number
  max_score?: unknown
  hits: Hit[]
}

interface CosmosTransactionsResponse {
  took: number
  time_out: boolean
  _shards: Shards
  hits: Hits
}

export class CosmosInfoClient {
  public baseURL: string

  constructor(baseURL: string = 'https://app-es.cosmostation.io') {
    this.baseURL = baseURL
  }

  public async fetchTransactions(
    identifier: ProtocolSymbols,
    address: string,
    offset: number,
    limit: number
  ): Promise<IAirGapTransaction[]> {
    const query: TransactionListQuery = new TransactionListQuery(offset, limit, address)
    const response: AxiosResponse<CosmosTransactionsResponse> = await Axios.post(
      `${this.baseURL}/cosmos/v1/getTxsByAddr`,
      query.toJSONBody()
    )
    if (response.data.hits.hits === null) {
      return []
    }
    const transactions: IAirGapTransaction[][] = response.data.hits.hits.map((hit: Hit) => {
      const transaction: Tx = hit._source.tx
      const timestamp = new Date(hit._source.timestamp).getTime() / 1000
      const fee: BigNumber = transaction.value.fee.amount
        .map((coin: Amount) => new BigNumber(coin.amount))
        .reduce((current: BigNumber, next: BigNumber) => current.plus(next))
      const result: IAirGapTransaction[] = transaction.value.msg
        .filter((message: Msg) => message.type === 'cosmos-sdk/MsgSend')
        .map((message: Msg) => {
          const destination: string = message.value.to_address

          return {
            amount: message.value.amount
              .map((coin: Amount) => new BigNumber(coin.amount))
              .reduce((current: BigNumber, next: BigNumber) => current.plus(next))
              .toString(10),
            to: [destination],
            from: [message.value.from_address],
            isInbound: destination === address,
            fee: fee.toString(10),
            protocolIdentifier: identifier,
            hash: hit._source.hash,
            timestamp
          }
        })

      return result
    })

    return transactions.reduce((current, next) => current.concat(next))
  }
}
