import Axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import { BigNumber } from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { isArray } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { NetworkError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { newAmount } from '@airgap/module-kit'

import { EthereumTransactionCursor } from '../../types/transaction'

import { EthereumInfoClient, EthereumInfoClientTransaction, EthereumInfoClientTransactionsResult } from './EthereumInfoClient'

export class EtherscanInfoClient extends EthereumInfoClient {
  constructor(baseURL: string) {
    super(baseURL)
  }

  public async fetchTransactions(
    address: string,
    limit: any,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumInfoClientTransactionsResult> {
    const airGapTransactions: EthereumInfoClientTransaction[] = []

    const page: number = cursor?.page ?? 1
    const url: string = `${this.baseURL}/api?module=account&action=txlist&address=${address}&page=${page}&offset=${limit}&sort=desc&apiKey=P63MEHEYBM5BGEG5WFN76VPNCET8B2MAP7`

    const response = await Axios.get(url)
    const transactionResponse = response.data
    const transactions = transactionResponse.result
    if (transactionResponse.status === '0' && (transactions === undefined || !isArray(transactions))) {
      throw new NetworkError(Domain.ETHEREUM, { response })
    }
    for (const transaction of transactions) {
      const fee: BigNumber = new BigNumber(transaction.gas).times(new BigNumber(transaction.gasPrice))
      const airGapTransaction: EthereumInfoClientTransaction = {
        from: [transaction.from],
        to: [transaction.to],
        isInbound: transaction.to.toLowerCase() === address.toLowerCase(),

        amount: newAmount(new BigNumber(transaction.value), 'blockchain'),
        fee: newAmount(fee, 'blockchain'),

        timestamp: parseInt(transaction.timeStamp, 10),
        status: {
          type: transaction.txreceipt_status === undefined || transaction.txreceipt_status === '1' ? 'applied' : 'failed',
          hash: new BigNumber(transaction.hash).toString(10),
          block: new BigNumber(transaction.blockNumber).toString(10)
        }
      }

      airGapTransactions.push(airGapTransaction)
    }

    return {
      transactions: airGapTransactions,
      cursor: {
        page: page + 1
      }
    }
  }

  public async fetchContractTransactions(
    contractAddress: string,
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumInfoClientTransactionsResult> {
    const airGapTransactions: EthereumInfoClientTransaction[] = []

    const page: number = cursor?.page ?? 1
    const url = `${this.baseURL}/api?module=account&action=tokentx&address=${address}&contractAddress=${contractAddress}&page=${page}&offset=${limit}&sort=desc&apiKey=P63MEHEYBM5BGEG5WFN76VPNCET8B2MAP7`

    const response = await Axios.get(url)
    const transactionResponse = response.data
    const transactions = transactionResponse.result
    if (transactionResponse.status === '0' && (transactions === undefined || !isArray(transactions))) {
      throw new NetworkError(Domain.ETHEREUM, { response })
    }
    for (const transaction of transactions) {
      const fee: BigNumber = new BigNumber(transaction.gas).times(new BigNumber(transaction.gasPrice))
      const airGapTransaction: EthereumInfoClientTransaction = {
        from: [transaction.from],
        to: [transaction.to],
        isInbound: transaction.to.toLowerCase() === address.toLowerCase(),

        amount: newAmount(new BigNumber(transaction.value), 'blockchain'),
        fee: newAmount(fee, 'blockchain'),

        timestamp: parseInt(transaction.timeStamp, 10),
        status: {
          type: transaction.txreceipt_status === undefined || transaction.txreceipt_status === '1' ? 'applied' : 'failed',
          hash: transaction.hash,
          block: transaction.blockNumber
        }
      }

      airGapTransactions.push(airGapTransaction)
    }

    return {
      transactions: airGapTransactions,
      cursor: {
        page: page + 1
      }
    }
  }
}
