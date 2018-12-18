import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { TezosOperationType, TezosWrappedOperation } from '../../protocols/TezosProtocol'

export type SerializedUnsignedTezosTransaction = [
  [Buffer, [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer]],
  Buffer
]

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
            transaction.transaction.jsonTransaction.contents.map(obj => {
              return [
                obj.amount,
                obj.counter,
                obj.destination,
                obj.fee,
                obj.gas_limit,
                obj.kind,
                obj.protocol,
                obj.source,
                obj.storage_limit
              ]
            })
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
              amount: obj[0].toString(),
              counter: obj[1].toString(),
              destination: obj[2].toString(),
              fee: obj[3].toString(),
              gas_limit: obj[4].toString(),
              kind: obj[5].toString() as TezosOperationType,
              protocol: obj[6].toString(),
              source: obj[7].toString(),
              storage_limit: obj[8].toString()
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
