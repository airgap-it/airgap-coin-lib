import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedUnsignedAeternityTransaction = [Buffer, Buffer]

export interface RawAeternityTransaction {
  networkId: string
  transaction: string
}

export interface UnsignedAeternityTransaction extends UnsignedTransaction {
  transaction: RawAeternityTransaction
}

export class AeternityUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(transaction: UnsignedAeternityTransaction): SerializedSyncProtocolTransaction {
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
      [transaction.transaction.networkId, transaction.transaction.transaction],
      transaction.publicKey, // publicKey
      transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
    ]) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedAeternityTransaction {
    const unsignedAeternityTx: UnsignedAeternityTransaction = {
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: {
        networkId: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0] as Buffer).toString(),
        transaction: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1] as Buffer).toString()
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }

    return unsignedAeternityTx
  }
}
