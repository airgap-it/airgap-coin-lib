import { toBuffer } from '../../utils/toBuffer'
import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'

export type SerializedUnsignedSubstrateTransaction = [Buffer]

export interface RawSubstrateTransaction {
  encoded: string
}

export interface UnsignedSubstrateTransaction extends UnsignedTransaction {
  transaction: RawSubstrateTransaction
}

export class SubstrateUnsignedTransactionsSerializer extends UnsignedTransactionSerializer {
  public serialize(transaction: UnsignedSubstrateTransaction): SerializedSyncProtocolTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] = [transaction.transaction.encoded]
    toSerialize[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY] = transaction.publicKey
    toSerialize[SyncProtocolUnsignedTransactionKeys.CALLBACK] = transaction.callback ? transaction.callback : 'airgap-wallet://?d='

    return toBuffer(toSerialize) as SerializedSyncProtocolTransaction
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedSubstrateTransaction {
    const unsignedTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedSubstrateTransaction

    return {
      transaction: {
        encoded: unsignedTx.toString()
      },
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
