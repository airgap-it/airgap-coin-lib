import { EthereumTransactionValidator } from './../unsigned-transactions/ethereum-transactions.validator'
import {
  SerializedSyncProtocolSignedTransaction,
  SignedTransaction,
  SignedTransactionSerializer,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedSignedEthereumTransaction = [Buffer]

export interface SignedEthereumTransaction extends SignedTransaction {
  accountIdentifier: string
  transaction: string
}

export class EthereumSignedTransactionSerializer extends SignedTransactionSerializer {
  public async serialize(transaction: SignedEthereumTransaction): Promise<SerializedSyncProtocolSignedTransaction> {
    const toSerialize: any[] = []

    const validator = new EthereumTransactionValidator()
    const errors = await validator.validateSignedTransaction(transaction)
    if (errors) {
      throw errors
    }

    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public async deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): Promise<SignedEthereumTransaction> {
    const signedTx = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
    const validator = new EthereumTransactionValidator()
    const errors = await validator.validateSignedTransaction(signedTx)

    if (errors) {
      throw errors
    }
    return signedTx
  }
}
