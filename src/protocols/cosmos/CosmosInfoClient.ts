import axios from 'axios'
import { BigNumber } from 'bignumber.js'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

class TransactionListQuery {
  constructor(private offset: number, private limit: number, private address: string) {}

  toJSON(): string {
    return JSON.stringify({
      from: this.offset,
      size: this.limit,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: this.address,
                fields: ['tx.value.msg.value.from_address', 'tx.value.msg.value.to_address']
              }
            }
          ]
        }
      },
      sort: [
        {
          height: {
            order: 'desc'
          }
        }
      ]
    })
  }
}

export class CosmosInfoClient {
  public baseURL: string

  constructor(baseURL: string = 'https://app-es.cosmostation.io') {
    this.baseURL = baseURL
  }

  public async fetchTransactions(identifier: string, address: string, offset: number, limit: number): Promise<IAirGapTransaction[]> {
    const query = new TransactionListQuery(offset, limit, address)
    const response = await axios.post(`${this.baseURL}/cosmos/v1/getTxsByAddr`, query.toJSON())
    const transactions: IAirGapTransaction[][] = response.data.hits.hits.map(hit => {
      const transaction = hit._source.tx
      const fee: BigNumber = transaction.value.fee.amount
        .map(coin => new BigNumber(coin.amount))
        .reduce((current: BigNumber, next: BigNumber) => current.plus(next))
      const result = transaction.value.msg.map(message => {
        const destination: string = message.value.to_address
        return {
          amount: message.value.amount
            .map(coin => new BigNumber(coin.amount))
            .reduce((current: BigNumber, next: BigNumber) => current.plus(next)) as BigNumber,
          to: [destination],
          from: [message.value.from_address as String],
          isInbound: destination === address,
          fee: fee,
          protocolIdentifier: identifier
        } as IAirGapTransaction
      })
      return result
    })
    return transactions.reduce((current, next) => current.concat(next))
  }
}
