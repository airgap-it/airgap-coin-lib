import {
  SerializedSyncProtocolTransaction,
  SyncProtocolUnsignedTransactionKeys,
  UnsignedTransaction,
  UnsignedTransactionSerializer
} from '../unsigned-transaction.serializer'
import { toBuffer } from '../utils/toBuffer'
import { TezosOperationType, TezosWrappedOperation, TezosSpendOperation } from '../../protocols/TezosProtocol'

export type SerializedUnsignedTezosTransaction = [Buffer, Buffer, [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer]]

export interface RawTezosTransaction {
  jsonTransaction: TezosWrappedOperation
  binaryTransaction: string
}

export interface UnsignedTezosTransaction extends UnsignedTransaction {
  transaction: RawTezosTransaction
}

export class TezosUnsignedTransactionSerializer extends UnsignedTransactionSerializer {
  public serialize(unsignedTx: UnsignedTezosTransaction): SerializedSyncProtocolTransaction {
    const spendOperation = unsignedTx.transaction.jsonTransaction.contents[
      Math.max(unsignedTx.transaction.jsonTransaction.contents.length - 1, 0)
    ] as TezosSpendOperation

    const toSerialize = [
      [
        unsignedTx.transaction.binaryTransaction,
        unsignedTx.transaction.jsonTransaction.branch,
        [
          spendOperation.amount,
          spendOperation.counter,
          spendOperation.destination,
          spendOperation.fee,
          spendOperation.gas_limit,
          spendOperation.kind,
          spendOperation.source,
          spendOperation.storage_limit
        ]
      ],
      unsignedTx.publicKey, // publicKey
      unsignedTx.callback ? unsignedTx.callback : 'airgap-wallet://?d=' // callback-scheme
    ]
    const serializedTx: SerializedSyncProtocolTransaction = toBuffer(toSerialize) as SerializedSyncProtocolTransaction

    return serializedTx
  }

  public deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTezosTransaction {
    const tezosTx = serializedTx[SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION] as SerializedUnsignedTezosTransaction
    const binaryTx = tezosTx[0]
    const branch = tezosTx[1]
    const jsonTx = tezosTx[2]

    return {
      transaction: {
        binaryTransaction: binaryTx.toString(),
        jsonTransaction: {
          branch: branch.toString(),
          contents: [
            {
              amount: jsonTx[0].toString(),
              counter: jsonTx[1].toString(),
              destination: jsonTx[2].toString(),
              fee: jsonTx[3].toString(),
              gas_limit: jsonTx[4].toString(),
              kind: jsonTx[5].toString() as TezosOperationType,
              source: jsonTx[6].toString(),
              storage_limit: jsonTx[7].toString()
            } as TezosSpendOperation
          ]
        }
      },
      publicKey: serializedTx[SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY].toString(),
      callback: serializedTx[SyncProtocolUnsignedTransactionKeys.CALLBACK].toString()
    }
  }
}
