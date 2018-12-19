import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { TezosOperationType, TezosWrappedOperation } from '../../protocols/TezosProtocol'

export type SerializedUnsignedTezosTransaction = [[Buffer, Buffer[][]], Buffer]

export interface RawTezosTransaction {
  jsonTransaction: TezosWrappedOperation
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}

export class TezosUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(transaction: UnsignedTezosTransaction): SerializedSyncProtocolTransaction {
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer([
      [
        [
          transaction.transaction.jsonTransaction.branch,
          [
            transaction.transaction.jsonTransaction.contents.map(obj => [
              obj.amount,
              obj.counter,
              obj.destination,
              obj.fee,
              obj.gas_limit,
              obj.kind,
              obj.source,
              obj.storage_limit
            ])
          ]
        ],
        transaction.transaction.binaryTransaction
      ],
      transaction.publicKey, // publicKey
      transaction.callback ? transaction.callback : 'airgap-wallet://?d=' // callback-scheme
    ]) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTezosTransaction {
    const serializedUnsignedTezosTx = serializedTx[
      SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION
    ] as SerializedUnsignedTezosTransaction

    const unsignedTezosTx: UnsignedTezosTransaction = {
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      transaction: {
        jsonTransaction: {
          branch: serializedUnsignedTezosTx[0][0].toString(),
          contents: serializedUnsignedTezosTx[0][1].map(obj => {
            return {
              amount: obj[0][0].toString(),
              counter: obj[0][1].toString(),
              destination: obj[0][2].toString(),
              fee: obj[0][3].toString(),
              gas_limit: obj[0][4].toString(),
              kind: obj[0][5].toString() as TezosOperationType,
              source: obj[0][6].toString(),
              storage_limit: obj[0][7].toString()
            }
          })
        },
        binaryTransaction: serializedUnsignedTezosTx[1].toString()
      },
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }

    return unsignedTezosTx
  }
}
