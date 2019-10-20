import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedUnsignedEthereumTransaction = [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer]

export interface RawEthereumTransaction {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: number
  data: string
}

export interface UnsignedEthereumTransaction extends UnsignedTransaction {
  transaction: RawEthereumTransaction
}

export class EthereumUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(transaction: UnsignedEthereumTransaction): SerializedSyncProtocolTransaction {
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
      [
        transaction.transaction.nonce,
        transaction.transaction.gasPrice,
        transaction.transaction.gasLimit,
        transaction.transaction.to,
        transaction.transaction.value,
        transaction.transaction.chainId,
        transaction.transaction.data ? transaction.transaction.data : '0x' // data is optional, include empty if necessary
      ],
      transaction.publicKey, // publicKey
      transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
    ]) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedEthereumTransaction {
    const unsignedEthereumTx: UnsignedEthereumTransaction = {
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: {
        nonce: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0].toString(),
        gasPrice: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1] as Buffer).toString(),
        gasLimit: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][2] as Buffer).toString(),
        to: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][3] as Buffer).toString(),
        value: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][4] as Buffer).toString(),
        chainId: parseInt((serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][5] as Buffer).toString(), 10),
        data: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][6] as Buffer).toString()
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }

    return unsignedEthereumTx
  }
}
