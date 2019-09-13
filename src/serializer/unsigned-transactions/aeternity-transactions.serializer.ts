import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { AeternityTransactionValidator } from './aeternity-transactions.validator'

export type SerializedUnsignedAeternityTransaction = [Buffer, Buffer]

export interface RawAeternityTransaction {
  networkId: string
  transaction: string
}

export interface UnsignedAeternityTransaction extends UnsignedTransaction {
  transaction: RawAeternityTransaction
}

export class AeternityUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(transaction: UnsignedAeternityTransaction): Promise<SerializedSyncProtocolTransaction> {
    return new Promise(async (resolve, reject) => {
      const validator = new AeternityTransactionValidator()
      const errors = await validator.validateUnsignedTransaction(transaction)
      if (errors) {
        reject()
        throw errors
      }
      const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
        [transaction.transaction.networkId, transaction.transaction.transaction],
        transaction.publicKey, // publicKey
        transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
      ]) as SerializedSyncProtocolTransaction

      resolve(serializedTx)
    })
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): Promise<UnsignedAeternityTransaction> {
    return new Promise((resolve, reject) => {
      const unsignedAeternityTx: UnsignedAeternityTransaction = {
        publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
        transaction: {
          networkId: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][0] as Buffer).toString(),
          transaction: (serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION][1] as Buffer).toString()
        },
        callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
      }

      const validator = new AeternityTransactionValidator()
      const errors = validator.validateUnsignedTransaction(unsignedAeternityTx)

      if (errors) {
        reject()
        throw errors
      }
      resolve(unsignedAeternityTx)
    })
  }
}
