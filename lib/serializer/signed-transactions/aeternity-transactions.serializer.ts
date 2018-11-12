import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'

export type SerializedSignedAeternityTransaction = [Buffer]

export interface SignedAeternityTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}

export class AeternitySignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedAeternityTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize)

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedAeternityTransaction {
    return {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
  }
}
