import { BitcoinTransactionValidator } from './../unsigned-transactions/bitcoin-transactions.validator'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

import {
  SerializedSyncProtocolSignedTransaction,
  SignedTransaction,
  SignedTransactionSerializer,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedSignedBitcoinTransaction = [Buffer, Buffer]

export interface SignedBitcoinTransaction extends SignedTransaction {
  from: string[]
  amount: BigNumber
  fee: BigNumber
  accountIdentifier: string
  transaction: string
}

export class BitcoinSignedTransactionSerializer extends SignedTransactionSerializer {
  public async serialize(transaction: SignedBitcoinTransaction): Promise<SerializedSyncProtocolSignedTransaction> {
    const toSerialize: any[] = []
    const validator = new BitcoinTransactionValidator()
    const errors = await validator.validateSignedTransaction(transaction)

    if (errors) {
      throw errors
    }
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.FROM] = transaction.from
    toSerialize[SyncProtocolSignedTransactionKeys.AMOUNT] = transaction.amount.toFixed()
    toSerialize[SyncProtocolSignedTransactionKeys.FEE] = transaction.fee.toFixed()

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public async deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): Promise<SignedBitcoinTransaction> {
    const signedTx: SignedBitcoinTransaction = {
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString(),
      from: serializedTx[SyncProtocolSignedTransactionKeys.FROM].map(obj => obj.toString()),
      amount: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.AMOUNT].toString()),
      fee: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.FEE].toString())
    }
    const validator = new BitcoinTransactionValidator()
    const errors = await validator.validateSignedTransaction(signedTx)
    if (errors) {
      throw errors
    }
    return signedTx
  }
}
