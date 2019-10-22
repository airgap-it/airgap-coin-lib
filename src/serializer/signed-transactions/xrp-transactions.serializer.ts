import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'

export interface SignedXrpTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}

export type SerializedSignedXrpTransaction = [Buffer]

export class XrpSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedXrpTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedXrpTransaction {
    const signedXrpTx: SignedXrpTransaction = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }

    return signedXrpTx
  }
}
