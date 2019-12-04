import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

export type SerializedUnsignedTezosTransaction = [Buffer]

export interface RawTezosTransaction {
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}

export class TezosUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedTezosTransaction): SerializedSyncProtocolTransaction {
    const toSerialize = [
      [unsignedTx.transaction.binaryTransaction],
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer(toSerialize) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTezosTransaction {
    const tezosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedTezosTransaction

    const binaryTx = tezosTx[0]

    return {
      transaction: {
        binaryTransaction: binaryTx.toString()
      },
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
