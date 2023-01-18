import Axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import { BigNumber } from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { isArray } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { AirGapTransactionStatus, IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { EthereumProtocol } from '../../EthereumProtocol'
import { BLOCK_EXPLORER_API } from '../../EthereumProtocolOptions'
import { EthereumTransactionCursor, EthereumTransactionResult } from '../../EthereumTypes'

import { EthereumInfoClient } from './InfoClient'
import { NetworkError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'

export class EtherscanInfoClient extends EthereumInfoClient {
  constructor(baseURL: string = BLOCK_EXPLORER_API) {
    super(baseURL)
  }

  public async fetchTransactions(
    protocol: EthereumProtocol,
    address: string,
    limit: any,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult> {
    const airGapTransactions: IAirGapTransaction[] = []

    const url = cursor
      ? `${this.baseURL}/api?module=account&action=txlist&address=${address}&page=${cursor.page}&offset=${limit}&sort=desc&apiKey=P63MEHEYBM5BGEG5WFN76VPNCET8B2MAP7`
      : `${this.baseURL}/api?module=account&action=txlist&address=${address}&page=1&offset=${limit}&sort=desc&apiKey=P63MEHEYBM5BGEG5WFN76VPNCET8B2MAP7`

    const response = await Axios.get(url)
    const transactionResponse = response.data
    const transactions = transactionResponse.result
    if (transactionResponse.status === '0' && (transactions === undefined || !isArray(transactions))) {
      throw new NetworkError(Domain.ETHEREUM, { response })
    }
    for (const transaction of transactions) {
      const fee: BigNumber = new BigNumber(transaction.gas).times(new BigNumber(transaction.gasPrice))
      const airGapTransaction: IAirGapTransaction = {
        hash: transaction.hash,
        from: [transaction.from],
        to: [transaction.to],
        isInbound: transaction.to.toLowerCase() === address.toLowerCase(),
        amount: new BigNumber(transaction.value).toString(10),
        fee: fee.toString(10),
        blockHeight: transaction.blockNumber,
        protocolIdentifier: await protocol.getIdentifier(),
        network: (await protocol.getOptions()).network,
        timestamp: parseInt(transaction.timeStamp, 10),
        status:
          transaction.txreceipt_status === undefined || transaction.txreceipt_status === '1'
            ? AirGapTransactionStatus.APPLIED
            : AirGapTransactionStatus.FAILED
      }

      airGapTransactions.push(airGapTransaction)
    }

    return {
      transactions: airGapTransactions,
      cursor: {
        page: cursor ? cursor.page + 1 : 2
      }
    }
  }

  public async fetchContractTransactions(
    protocol: EthereumProtocol,
    contractAddress: string,
    address: string,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<EthereumTransactionResult> {
    const airGapTransactions: IAirGapTransaction[] = []

    const url = cursor
      ? `${this.baseURL}/api?module=account&action=tokentx&address=${address}&contractAddress=${contractAddress}&page=${cursor.page}&offset=${limit}&sort=desc&apiKey=P63MEHEYBM5BGEG5WFN76VPNCET8B2MAP7`
      : `${this.baseURL}/api?module=account&action=tokentx&address=${address}&contractAddress=${contractAddress}&page=1&offset=${limit}&sort=desc&apiKey=P63MEHEYBM5BGEG5WFN76VPNCET8B2MAP7`

    const response = await Axios.get(url)
    const transactionResponse = response.data
    const transactions = transactionResponse.result
    if (transactionResponse.status === '0' && (transactions === undefined || !isArray(transactions))) {
      throw new NetworkError(Domain.ETHEREUM, { response })
    }
    for (const transaction of transactions) {
      const fee: BigNumber = new BigNumber(transaction.gas).times(new BigNumber(transaction.gasPrice))
      const airGapTransaction: IAirGapTransaction = {
        hash: transaction.hash,
        from: [transaction.from],
        to: [transaction.to],
        isInbound: transaction.to.toLowerCase() === address.toLowerCase(),
        blockHeight: transaction.blockNumber,
        protocolIdentifier: await protocol.getIdentifier(),
        network: (await protocol.getOptions()).network,
        amount: new BigNumber(transaction.value).toString(10),
        fee: fee.toString(10),
        timestamp: parseInt(transaction.timeStamp, 10),
        status:
          transaction.txreceipt_status === undefined || transaction.txreceipt_status === '1'
            ? AirGapTransactionStatus.APPLIED
            : AirGapTransactionStatus.FAILED
      }

      airGapTransactions.push(airGapTransaction)
    }

    return {
      transactions: airGapTransactions,
      cursor: {
        page: cursor ? cursor.page + 1 : 2
      }
    }
  }
}
