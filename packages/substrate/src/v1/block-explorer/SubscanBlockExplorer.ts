import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'
import { SubstrateTransactionCursor } from '../types/transaction'
import { SubstrateBlockExplorer } from './SubstrateBlockExplorer'

export class SubscanBlockExplorer implements SubstrateBlockExplorer {
  public constructor(private readonly apiUrl: string) {}

  public async getTransactions<_Units extends string>(
    address: string,
    protocolUnit: _Units,
    limit: number,
    cursor?: SubstrateTransactionCursor | undefined
  ): Promise<Partial<AirGapTransaction<_Units>>[]> {
    const body = cursor ? { row: limit, page: cursor.page, address } : { row: limit, page: 0, address }
    const responses = await Promise.all([
      axios.post(`${this.apiUrl}/transfers`, body),
      axios.post(`${this.apiUrl}/account/reward_slash`, body)
    ])

    const transfers = responses[0].data.data?.transfers
    const rewardSlash = responses[1].data.data?.list

    const airGapTransfers: Partial<AirGapTransaction<_Units>>[] = transfers
      ? transfers
          .filter((tx) => tx.module === 'balances')
          .map((tx): Partial<AirGapTransaction<_Units>> => {
            return {
              from: [tx.from],
              to: [tx.to],
              isInbound: address.includes(tx.to),

              amount: newAmount(tx.amount, protocolUnit),
              fee: newAmount(tx.fee, 'blockchain'),

              timestamp: tx.block_timestamp,
              status: {
                type: tx.success !== undefined ? (tx.success ? 'applied' : 'failed') : 'unknown',
                hash: tx.hash,
                block: tx.block_num
              }
            }
          })
      : []

    const airGapPayouts: Partial<AirGapTransaction<_Units>>[] = rewardSlash
      ? rewardSlash
          .filter((tx) => tx.event_id === 'Reward')
          .map((tx): Partial<AirGapTransaction<_Units>> => {
            return {
              from: ['Staking Reward'],
              to: [address],
              isInbound: true,

              amount: newAmount(tx.amount, 'blockchain'),
              fee: newAmount('0', 'blockchain'),

              timestamp: tx.block_timestamp,
              status: {
                type: 'applied',
                hash: tx.extrinsic_hash,
                block: tx.block_num
              }
            }
          })
      : []

    return airGapTransfers
      .concat(airGapPayouts)
      .sort((a, b) => (a.timestamp !== undefined && b.timestamp !== undefined ? b.timestamp - a.timestamp : 0))
  }
}
