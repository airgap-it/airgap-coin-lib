import axios from '../../../../dependencies/src/axios-0.19.0'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { SubstrateNetwork } from '../../SubstrateNetwork'

export class SubstrateBlockExplorerClient {
  constructor(readonly network: SubstrateNetwork, readonly apiUrl: string) {}

  public async getTransactions(address: string, size: number, pageNumber: number, protocolDecimals: number): Promise<IAirGapTransaction[]> {
    const body = { row: size, page: pageNumber - 1, address }
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
              amount: new BigNumber(transfer.amount).shiftedBy(protocolDecimals).toFixed(),
              timestamp: transfer.block_timestamp,
              fee: transfer.fee,
              hash: transfer.hash,
              blockHeight: transfer.block_num
            } as IAirGapTransaction
          })
      : []
  }
}
