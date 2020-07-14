import axios from '../../../../dependencies/src/axios-0.19.0'
import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { SubstrateNetwork } from '../../SubstrateNetwork'

export class SubstrateBlockExplorerClient {
  constructor(readonly network: SubstrateNetwork, readonly apiUrl: string) {}

  public async getTransactions(address: string, size: number, pageNumber: number): Promise<IAirGapTransaction[]> {
    const body = { row: size, page: pageNumber - 1, address: address }
    const response = await axios.post(`${this.apiUrl}/transfers`, body)
    const transfers = response.data.data.transfers
    return transfers
      ? transfers
          .filter((transfer) => transfer.module === 'balances' && transfer.success)
          .map((transfer) => {
            return {
              from: [transfer.from],
              to: [transfer.to],
              isInbound: address.includes(transfer.to),
              amount: transfer.amount,
              timestamp: transfer.block_timestamp,
              fee: transfer.fee,
              hash: transfer.hash,
              blockHeight: transfer.block_num
            } as IAirGapTransaction
          })
      : []
  }
}
