import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import BigNumber from 'bignumber.js'

export type SerializedSignedBitcoinTransaction = [Buffer, Buffer]

export interface SignedBitcoinTransaction extends SignedTransaction {
  from: string[]
  amount: BigNumber
  fee: BigNumber
  publicKey: string
  transaction: string
}

export class BitcoinSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedBitcoinTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.PUBLIC_KEY] = transaction.publicKey
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction
    toSerialize[SyncProtocolSignedTransactionKeys.FROM] = transaction.from
    toSerialize[SyncProtocolSignedTransactionKeys.AMOUNT] = transaction.amount.toString()
    toSerialize[SyncProtocolSignedTransactionKeys.FEE] = transaction.fee.toString()

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize)

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedBitcoinTransaction {
    return {
      publicKey: serializedTx[SyncProtocolSignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString(),
      from: serializedTx[SyncProtocolSignedTransactionKeys.FROM].map(obj => obj.toString()),
      amount: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.AMOUNT].toString()),
      fee: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.FEE].toString())
    }
  }
}
