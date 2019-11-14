import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import {
  SerializedSyncProtocolSignedTransaction,
  SignedTransaction,
  SignedTransactionSerializer,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export interface SignedTezosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}

export type SerializedSignedTezosTransaction = [Buffer]

export class TezosSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedTezosTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTezosTransaction {
    const signedTezosTx: SignedTezosTransaction = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }

    return signedTezosTx
  }
}
