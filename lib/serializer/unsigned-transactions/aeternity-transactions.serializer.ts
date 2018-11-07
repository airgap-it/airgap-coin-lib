import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedUnsignedAeternityTransaction = [Buffer]

export type RawAeternityTransaction = string

export interface UnsignedAeternityTransaction extends UnsignedTransaction {
  transaction: RawAeternityTransaction
}

export class AeternityUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(transaction: UnsignedAeternityTransaction): SerializedSyncProtocolTransaction {
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
      [transaction.transaction],
      transaction.publicKey, // publicKey
      transaction.callback ? transaction.callback : 'airgap-vault://?d=' // callback-scheme
    ])

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedAeternityTransaction {
    const unsignedAeternityTx: UnsignedAeternityTransaction = {
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }

    return unsignedAeternityTx
  }
}
