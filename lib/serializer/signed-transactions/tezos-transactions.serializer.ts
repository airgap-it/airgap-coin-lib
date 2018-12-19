import { toBuffer } from '../utils/toBuffer'
import {
  SignedTransaction,
  SignedTransactionSerializer,
  SerializedSyncProtocolSignedTransaction,
  SyncProtocolSignedTransactionKeys
} from '../signed-transaction.serializer'
import { TezosTransaction } from '../../interfaces/IAirGapSignedTransaction'
import BigNumber from 'bignumber.js'
import { TezosOperationType } from '../../protocols/TezosProtocol'

export type SerializedSignedTezosTransaction = [
  Buffer,
  Buffer,
  [Buffer, [Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer, Buffer]]
]

export interface SignedTezosTransaction extends SignedTransaction {
  from: string[]
  amount: BigNumber
  fee: BigNumber
  accountIdentifier: string
  transaction: TezosTransaction
}

export class TezosSignedTransactionSerializer extends SignedTransactionSerializer {
  public serialize(transaction: SignedTezosTransaction): SerializedSyncProtocolSignedTransaction {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] = [
      transaction.transaction.bytes,
      transaction.transaction.signature,
      [
        transaction.transaction.transaction.branch,
        transaction.transaction.transaction.contents.map(obj => {
          return [obj.amount, obj.counter, obj.destination, obj.fee, obj.gas_limit, obj.kind, obj.source, obj.storage_limit]
        })
      ]
    ]
    toSerialize[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER] = transaction.accountIdentifier
    toSerialize[SyncProtocolSignedTransactionKeys.FROM] = transaction.from
    toSerialize[SyncProtocolSignedTransactionKeys.FEE] = transaction.fee.toFixed()
    toSerialize[SyncProtocolSignedTransactionKeys.AMOUNT] = transaction.amount.toFixed()

    const serializedBuffer: SerializedSyncProtocolSignedTransaction = toBuffer(toSerialize) as SerializedSyncProtocolSignedTransaction

    return serializedBuffer
  }

  public deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTezosTransaction {
    const tezosTx = serializedTx[SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION] as SerializedSignedTezosTransaction

    const signedTezosTx: SignedTezosTransaction = {
      from: serializedTx[SyncProtocolSignedTransactionKeys.FROM].map(obj => obj.toString()),
      amount: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.AMOUNT].toString()),
      fee: new BigNumber(serializedTx[SyncProtocolSignedTransactionKeys.FEE].toString()),
      accountIdentifier: serializedTx[SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER].toString(),
      transaction: {
        bytes: tezosTx[0],
        signature: tezosTx[1].toString(),
        transaction: {
          branch: tezosTx[2][0].toString(),
          contents: tezosTx[2][1].map(obj => {
            return {
              amount: obj[0].toString(),
              counter: obj[1].toString(),
              destination: obj[2].toString(),
              fee: obj[3].toString(),
              gas_limit: obj[4].toString(),
              kind: obj[5].toString() as TezosOperationType,
              source: obj[6].toString(),
              storage_limit: obj[7].toString()
            }
          })
        }
      }
    }

    return signedTezosTx
  }
}
