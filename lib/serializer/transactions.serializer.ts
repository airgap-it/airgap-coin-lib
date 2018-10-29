import { IAirGapTransaction } from '..'
import { Serializer, EncodedType } from './serializer'
import { UnsignedEthereumTransaction } from './transactions/ethereum-transactions.serializer'

export abstract class TransactionSerializer extends Serializer {
  public abstract serialize(...args: any): string
  public abstract deserialize(serializedTx: string): IAirGapTransaction
}

export type UnsignedTransaction = UnsignedEthereumTransaction

export enum SyncProtocolUnsignedTransactionKeys {
  UNSIGNED_TRANSACTION,
  FROM,
  TO,
  AMOUNT,
  FEE,
  PUBLIC_KEY
}

export interface SerializedSyncProtocolTransaction extends Array<boolean | number | UnsignedTransaction | string | EncodedType | string[]> {
  [SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION]: UnsignedTransaction
  [SyncProtocolUnsignedTransactionKeys.FROM]: string
  [SyncProtocolUnsignedTransactionKeys.TO]: string[]
  [SyncProtocolUnsignedTransactionKeys.AMOUNT]: string[]
  [SyncProtocolUnsignedTransactionKeys.FEE]: string
  [SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY]: string
}
