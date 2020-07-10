import axios from '../../../../dependencies/src/axios-0.19.0'
import { IAirGapTransaction } from '../../../../interfaces/IAirGapTransaction'
import { SubstrateNetwork } from '../../SubstrateNetwork'
import { SubstrateAddress } from '../data/account/SubstrateAddress'

export class SubstrateBlockExplorerClient {
  constructor(readonly network: SubstrateNetwork, readonly apiUrl: string) {}

  public async getTransactions(address: string, size: number, pageNumber: number): Promise<Partial<IAirGapTransaction[]>> {
    const response = await axios.get(
      `${this.apiUrl}/balances/transfer?&filter[address]=${address}&page[size]=${size}&page[number]=${pageNumber}`
    )

    return response.data.data
      .filter(
        (transfer) =>
          transfer.type === 'balancetransfer' &&
          (transfer.attributes.event_id.toLowerCase() === 'transfer' || transfer.attributes.event_id.toLowerCase() === 'reward')
      )
      .map((transfer) => {
        const attributes = transfer.attributes

        const from =
          attributes.sender?.id !== undefined
            ? SubstrateAddress.fromPublicKey(attributes.sender.id, this.network).toString()
            : attributes.sender.name

        const destination =
          attributes.destination?.id !== undefined && attributes.destination?.type === 'account'
            ? SubstrateAddress.fromPublicKey(attributes.destination.id, this.network).toString()
            : address

        return {
          from: [from],
          to: [destination],
          isInbound: address.includes(destination),
          amount: transfer.attributes.value,
          fee: transfer.attributes.fee,
          hash: transfer.id,
          blockHeight: transfer.attributes.block_id
        }
      })
  }
}
