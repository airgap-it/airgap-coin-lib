import { EncodedType } from './serializer'
import { SerializedUnsignedEthereumTransaction, RawEthereumTransaction } from './transactions/ethereum-transactions.serializer'
import BigNumber from 'bignumber.js'
export abstract class TransactionSerializer {
  public abstract serialize(...args: any[]): SerializedSyncProtocolTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTransaction
}

export interface UnsignedTransaction {
  transaction: RawEthereumTransaction
  from?: string
  to?: string
  amount?: BigNumber
  fee?: BigNumber
  publicKey: string
  callback?: string
}

export type SerializedUnsignedTransaction = SerializedUnsignedEthereumTransaction

export enum SyncProtocolUnsignedTransactionKeys {
  UNSIGNED_TRANSACTION,
  FROM,
  TO,
  AMOUNT,
  FEE,
  PUBLIC_KEY,
  CALLBACK
}

export interface SerializedSyncProtocolTransaction extends Array<SerializedUnsignedTransaction | Buffer | Buffer[]> {
  [SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION]: SerializedUnsignedTransaction
  [SyncProtocolUnsignedTransactionKeys.FROM]: Buffer[]
  [SyncProtocolUnsignedTransactionKeys.TO]: Buffer[]
  [SyncProtocolUnsignedTransactionKeys.AMOUNT]: Buffer[]
  [SyncProtocolUnsignedTransactionKeys.FEE]: Buffer
  [SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY]: Buffer
  [SyncProtocolUnsignedTransactionKeys.CALLBACK]: Buffer
}
