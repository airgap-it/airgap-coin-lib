import {
  SignedTransactionSerializer,
  SignedTransaction,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedSignedSubstrateTransaction = [Buffer]

export interface SignedSubstrateTransaction extends SignedTransaction {}

export class SubstrateSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedSubstrateTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier

    return toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedSubstrateTransaction {
    return {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
  }
}
