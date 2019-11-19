import axios from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

// tslint:disable:max-classes-per-file

class TransactionListQuery {
  constructor(private offset: number, private limit: number, private address: string) {}

  public toRLPBody(): string {
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
    const response = await axios.post(`${this.baseURL}/cosmos/v1/getTxsByAddr`, query.toRLPBody())
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
            .reduce((current: BigNumber, next: BigNumber) => current.plus(next))
            .toString(10),
          to: [destination],
          from: [message.value.from_address as string],
          isInbound: destination === address,
          fee: fee.toString(10),
          protocolIdentifier: identifier
        }
      })

      return result
    })

    return transactions.reduce((current, next) => current.concat(next))
  }
}
