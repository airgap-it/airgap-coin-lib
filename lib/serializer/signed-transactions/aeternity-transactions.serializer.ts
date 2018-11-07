import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'

export type SerializedSignedAeternityTransaction = [Buffer]

export interface SignedAeternityTransaction extends SignedTransaction {
  publicKey: string
  transaction: string
}

export class AeternitySignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedAeternityTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.PUBLIC_KEY] = transaction.publicKey
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize)

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedAeternityTransaction {
    return {
      publicKey: serializedTx[SyncProtocolSignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
  }
}
