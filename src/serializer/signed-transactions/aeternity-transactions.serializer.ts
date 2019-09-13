import { AeternityTransactionValidator } from './../unsigned-transactions/aeternity-transactions.validator'
import {
  SerializedSyncProtocolSignedTransaction,
  SignedTransaction,
  SignedTransactionSerializer,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedSignedAeternityTransaction = [Buffer]

export interface SignedAeternityTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}

export class AeternitySignedTransactionSerializer extends SignedTransactionSerializer {
  public async serialize(transaction: SignedAeternityTransaction): Promise<SerializedSyncProtocolSignedTransaction> {
    const toSerialize: any[] = []
    const validator = new AeternityTransactionValidator()
    const errors = await validator.validateSignedTransaction(transaction)
    if (errors) {
      throw errors
      // resolve(errors)
    }
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public async deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): Promise<SignedAeternityTransaction> {
    const signedTx: SignedAeternityTransaction = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }

    const validator = new AeternityTransactionValidator()
    const errors = await validator.validateSignedTransaction(signedTx)

    if (errors) {
      throw errors
    }
    return signedTx
  }
}
