import { SerializedUnsignedEthereumTransaction, RawEthereumTransaction } from './unsigned-transactions/ethereum-transactions.serializer'
import { RawBitcoinTransaction, SerializedUnsignedBitcoinTransaction } from './unsigned-transactions/bitcoin-transactions.serializer'

export abstract class UnsignedTransactionSerializer {
  public abstract serialize(unsignedTx: UnsignedTransaction): SerializedSyncProtocolTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTransaction
}

export interface UnsignedTransaction {
  transaction: RawEthereumTransaction | RawBitcoinTransaction
  publicKey: string
  callback?: string
}

export type SerializedUnsignedTransaction = SerializedUnsignedEthereumTransaction | SerializedUnsignedBitcoinTransaction

export enum SyncProtocolUnsignedTransactionKeys {
  UNSIGNED_TRANSACTION,
  PUBLIC_KEY,
  CALLBACK
}

export interface SerializedSyncProtocolTransaction extends Array<SerializedUnsignedTransaction | Buffer | Buffer[]> {
  [SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION]: SerializedUnsignedTransaction
  [SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY]: Buffer
  [SyncProtocolUnsignedTransactionKeys.CALLBACK]: Buffer
}
