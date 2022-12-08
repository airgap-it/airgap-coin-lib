import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { AirGapTransactionStatus, IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { SubstrateNetwork } from '../../SubstrateNetwork'

import { SubstrateTransactionCursor } from '../../SubstrateTypes'

export class SubstrateBlockExplorerClient {
  constructor(readonly network: SubstrateNetwork, readonly apiUrl: string) {}

  public async getTransactions(
    address: string,
    limit: number,
    protocolDecimals: number,
    cursor?: SubstrateTransactionCursor
  ): Promise<IAirGapTransaction[]> {
    const body = cursor ? { row: limit, page: cursor.page, address } : { row: limit, page: 0, address }
    const responses = await Promise.all([
      axios.post(`${this.apiUrl}/transfers`, body),
      axios.post(`${this.apiUrl}/account/reward_slash`, body)
    ])

    const transfers = responses[0].data.data?.transfers
    const rewardSlash = responses[1].data.data?.list

    const airGapTransfers: IAirGapTransaction[] = transfers
      ? transfers
          .filter((tx) => tx.module === 'balances')
          .map((tx) => {
            return {
              from: [tx.from],
              to: [tx.to],
              isInbound: address.includes(tx.to),
              amount: new BigNumber(tx.amount).shiftedBy(protocolDecimals).toFixed(),
              timestamp: tx.block_timestamp,
              fee: tx.fee,
              hash: tx.hash,
              blockHeight: tx.block_num,
              status: tx.success !== undefined ? (tx.success ? AirGapTransactionStatus.APPLIED : AirGapTransactionStatus.FAILED) : undefined
            }
          })
      : []

    const airGapPayouts: IAirGapTransaction[] = rewardSlash
      ? rewardSlash
          .filter((tx) => tx.event_id === 'Reward')
          .map((tx) => {
            return {
              from: ['Staking Reward'],
              to: [address],
              amount: tx.amount,
              isInbound: true,
              timestamp: tx.block_timestamp,
              fee: '0',
              hash: tx.extrinsic_hash,
              blockHeight: tx.block_num,
              status: AirGapTransactionStatus.APPLIED
            }
          })
      : []

    return airGapTransfers
      .concat(airGapPayouts)
      .sort((a, b) => (a.timestamp !== undefined && b.timestamp !== undefined ? b.timestamp - a.timestamp : 0))
  }
}
