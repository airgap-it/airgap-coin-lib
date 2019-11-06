import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import {
  SerializedSyncProtocolSignedTransaction,
  SignedTransaction,
  SignedTransactionSerializer,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export interface SignedCosmosTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: IAirGapSignedTransaction
}

export type SerializedSignedCosmosTransaction = [Buffer]

export class CosmosSignedTransactionSerializer extends SignedTransactionSerializer {
  public async serialize(transaction: SignedCosmosTransaction): Promise<SerializedSyncProtocolSignedTransaction> {
    // TODO: implement validation logic
    // const validator = new CosmosTransactionValidator()

    // validator.validateSignedTransaction(transaction)
    // const errors = await validator.validateSignedTransaction(transaction)
    // if (errors) {
    //   throw errors
    // }
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public async deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): Promise<SignedCosmosTransaction> {
    const signedTezosTx: SignedCosmosTransaction = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
    // TODO: implement validation logic
    // const validator = new CosmosTransactionValidator()

    // // TODO return promise instead
    // const errors = await validator.validateSignedTransaction(signedTezosTx)
    // if (errors) {
    //   throw errors
    // }

    return signedTezosTx
  }
}
