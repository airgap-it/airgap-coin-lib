import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'

export type SerializedSignedTezosTransaction = [[Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer], Buffer]

export interface SignedTezosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}

export class TezosSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedTezosTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTezosTransaction {
    return {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
  }
}
