import { SerializedSyncProtocolTransaction } from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'

export type SerializedSignedEthereumTransaction = [Buffer]

export interface SignedEthereumTransaction extends SignedTransaction {
  publicKey: string
  transaction: string
}

export class EthereumSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedEthereumTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.PUBLIC_KEY] = transaction.publicKey
    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = transaction.transaction

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize)

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedEthereumTransaction {
    return {
      publicKey: serializedTx[SyncProtocolSignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION].toString()
    }
  }
}
