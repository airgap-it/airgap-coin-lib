import { TransactionSerializer, SerializedSyncProtocolTransaction, SyncProtocolUnsignedTransactionKeys } from '../transactions.serializer'
import BigNumber from 'bignumber.js'
import { SerializedSyncProtocol, EncodedType, SyncProtocolKeys } from '../serializer'
import Web3 from 'web3'
import * as rlp from 'rlp'
import { IAirGapTransaction } from '../..'

const localWeb3: Web3 = new Web3()

export type UnsignedEthereumTransaction = [string, string, string, string, string, string]

export class EthereumUnsignedTransactionSerializer extends TransactionSerializer {
  public serialize(from: string, fee: BigNumber, amount: BigNumber, publicKey: string, transaction: UnsignedEthereumTransaction): string {
    const serializedTx: SerializedSyncProtocol = [
      1, // version
      EncodedType.UNSIGNED_TRANSACTION,
      'eth', // protocol identifier
      [
        transaction,
        from, // from
        [], // to
        [localWeb3.utils.stringToHex(amount.toString())], // amount
        localWeb3.utils.stringToHex(fee.toString()), // fee
        publicKey // publicKey
      ]
    ]

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return rlp.encode(serializedTx as any).toString('base64')
  }

  public deserialize(serializedTx: string): IAirGapTransaction {
    const base64DecodedBuffer = Buffer.from(serializedTx, 'base64')
    const rlpDecodedTx: SerializedSyncProtocol = (rlp.decode(base64DecodedBuffer as any) as unknown) as SerializedSyncProtocol
    const payload: SerializedSyncProtocolTransaction = rlpDecodedTx[SyncProtocolKeys.PAYLOAD] as SerializedSyncProtocolTransaction

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(payload[SyncProtocolUnsignedTransactionKeys.AMOUNT][0]),
      fee: new BigNumber(payload[SyncProtocolUnsignedTransactionKeys.FEE]),
      from: [payload[SyncProtocolUnsignedTransactionKeys.FROM]],
      to: [''], // ToDo
      isInbound: true, // ToDo
      protocolIdentifier: rlpDecodedTx[SyncProtocolKeys.PROTOCOL]
    }

    return airgapTx
  }
}
