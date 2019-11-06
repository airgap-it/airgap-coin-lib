import axios from '../../../../dependencies/src/axios-0.19.0/index'

import { BigNumber } from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'

export abstract class EthereumInfoClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  public abstract async fetchTransactions(identifier: string, address: string, page: number, limit: number): Promise<IAirGapTransaction[]>
  public abstract async fetchContractTransactions(
    identifier: string,
    contractAddress: string,
    address: string,
    page: number,
    limit: number
  ): Promise<IAirGapTransaction[]>
}

export class TrustWalletInfoClient extends EthereumInfoClient {
  constructor(baseURL: string = 'https://api.trustwalletapp.com') {
    super(baseURL)
  }

  public async fetchTransactions(identifier: string, address: string, page: number, limit: number): Promise<IAirGapTransaction[]> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.baseURL}/transactions?address=${address}&page=${page}&limit=${limit}&filterContractInteraction=true`)
        .then(response => {
          const transactionResponse = response.data
          const airGapTransactions: IAirGapTransaction[] = []
          for (const transaction of transactionResponse.docs) {
            const fee = new BigNumber(transaction.gasUsed).times(new BigNumber(transaction.gasPrice))
            const airGapTransaction: IAirGapTransaction = {
              hash: transaction.id,
              from: [transaction.from],
              to: [transaction.to],
              isInbound: transaction.to.toLowerCase() === address.toLowerCase(),
              amount: new BigNumber(transaction.value),
              fee,
              blockHeight: transaction.blockNumber,
              protocolIdentifier: identifier,
              timestamp: parseInt(transaction.timeStamp, 10)
            }
            airGapTransactions.push(airGapTransaction)
          }
          resolve(airGapTransactions)
        })
        .catch(reject)
    })
  }

  public async fetchContractTransactions(
    identifier: string,
    contractAddress: string,
    address: string,
    page: number,
    limit: number
  ): Promise<IAirGapTransaction[]> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.baseURL}/transactions?address=${address}&contract=${contractAddress}&page=${page}&limit=${limit}`)
        .then(response => {
          const transactionResponse = response.data
          const airGapTransactions: IAirGapTransaction[] = []
          for (const transaction of transactionResponse.docs) {
            if (transaction.operations.length >= 1) {
              const transactionPayload = transaction.operations[0]
              const fee = new BigNumber(transaction.gasUsed).times(new BigNumber(transaction.gasPrice))
              const airGapTransaction: IAirGapTransaction = {
                hash: transaction.id,
                from: [transactionPayload.from],
                to: [transactionPayload.to],
                isInbound: transactionPayload.to.toLowerCase() === address.toLowerCase(),
                blockHeight: transaction.blockNumber,
                protocolIdentifier: identifier,
                amount: new BigNumber(transactionPayload.value),
                fee,
                timestamp: parseInt(transaction.timeStamp, 10)
              }
              airGapTransactions.push(airGapTransaction)
            }
          }
          resolve(airGapTransactions)
        })
        .catch(reject)
    })
  }
}
