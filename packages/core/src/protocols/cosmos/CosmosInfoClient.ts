import { CosmosTransactionCursor } from './CosmosTypes'
import Axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

import { CosmosProtocol } from './CosmosProtocol'
export interface Attribute {
  key: string;
  value: string;
}

export interface Event {
  type: string;
  attributes: Attribute[];
}

export interface Log {
  msg_index: number;
  log: string;
  events: Event[];
}

export interface Amount {
  denom: string;
  amount: string;
}

export interface Value {
  amount: Amount[];
  to_address: string;
  from_address: string;
}
export interface Fee {
  gas: string;
  amount: Amount[];
}

export interface CosmosTransactionsResponse {
  id: number;
  height: number;
  tx_hash: string;
  logs: Log[];
  msg: Msg[];
  fee: Fee;
  gas_wanted: number;
  gas_used: number;
  memo: string;
  timestamp: Date;
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


export class CosmosInfoClient {
  public baseURL: string

  constructor(baseURL: string = 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://api.cosmostation.io/v1') {
    this.baseURL = baseURL
  }

  public async fetchTransactions(
    protocol: CosmosProtocol,
    address: string,
    limit: number,
    cursor?: CosmosTransactionCursor
  ): Promise<IAirGapTransaction[]> {
    if (cursor) {
      return []
    }
    const response: AxiosResponse<CosmosTransactionsResponse[]> = await Axios.get(
      `${this.baseURL}/account/txs/${address}`,
    )

    const transactions: IAirGapTransaction[][] = response.data.map((transaction) => {
      const timestamp = new Date(transaction.timestamp).getTime() / 1000
      const fee: BigNumber = transaction.fee.amount
        .map((coin: Amount) => new BigNumber(coin.amount))
        .reduce((current: BigNumber, next: BigNumber) => current.plus(next))
      const result: IAirGapTransaction[] = transaction.msg
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
            protocolIdentifier: protocol.identifier,
            network: protocol.options.network,
            hash: transaction.tx_hash,
            timestamp
          }
        })

      return result
    })

    return transactions.reduce((current, next) => current.concat(next))
  }
}
