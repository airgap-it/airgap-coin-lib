import { TezosTransactionValidator } from './../unsigned-transactions/tezos-transactions.validator'
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
  public async serialize(transaction: SignedTezosTransaction): Promise<SerializedSyncProtocolSignedTransaction> {
    const validator = new TezosTransactionValidator()

    validator.validateSignedTransaction(transaction)
    const errors = await validator.validateSignedTransaction(transaction)
    if (errors) {
      throw errors
    }
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public async deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): Promise<SignedTezosTransaction> {
    const signedTezosTx: SignedTezosTransaction = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
    const validator = new TezosTransactionValidator()

    // TODO return promise instead
    const errors = await validator.validateSignedTransaction(signedTezosTx)
    if (errors) {
      throw errors
    }

    return signedTezosTx
  }
}
