import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'

import { TezosTransactionValidator } from './tezos-transactions.validator'

export type SerializedUnsignedTezosTransaction = [Buffer]

export interface RawTezosTransaction {
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}

export class TezosUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedTezosTransaction): Promise<SerializedSyncProtocolTransaction> {
    const validator = new TezosTransactionValidator()

    return new Promise(async resolve => {
      const errors = await validator.validateUnsignedTransaction(unsignedTx)
      if (errors) {
        throw errors
      }

      const toSerialize = [
        [unsignedTx.transaction.binaryTransaction],
        unsignedTx.publicKey, // publicKey
        unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
      ]
      const serializedTx: SerializedSyncProtocolTransaction = toBuffer(toSerialize) as SerializedSyncProtocolTransaction
      resolve(serializedTx)
    })
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): Promise<UnsignedTezosTransaction> {
    return new Promise(async (resolve, reject) => {
      const tezosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedTezosTransaction

      const binaryTx = tezosTx[0]
      const unsignedTezosTx: UnsignedTezosTransaction = {
        transaction: {
          binaryTransaction: binaryTx.toString()
        },
        publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
        callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
      }
      const validator = new TezosTransactionValidator()
      const errors = await validator.validateUnsignedTransaction(unsignedTezosTx)

      // TODO beware that this is async
      if (errors) {
        reject()
        throw errors
      }
      resolve(unsignedTezosTx)
    })
  }
}
