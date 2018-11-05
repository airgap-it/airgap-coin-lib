import { SerializedSyncProtocolTransaction } from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'

export type SerializedSignedBitcoinTransaction = [Buffer, Buffer]

export interface SignedBitcoinTransaction extends SignedTransaction {
  publicKey: string
  transaction: string
}

export class BitcoinSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedBitcoinTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.PUBLIC_KEY] = transaction.publicKey
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize)

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedBitcoinTransaction {
    return {
      publicKey: serializedTx[SyncProtocolSignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
  }
}
