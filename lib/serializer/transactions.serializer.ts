import { SerializedUnsignedEthereumTransaction, RawEthereumTransaction } from './transactions/ethereum-transactions.serializer'
import { RawBitcoinTransaction, SerializedUnsignedBitcoinTransaction } from './transactions/bitcoin-transactions.serializer'
export abstract class TransactionSerializer {
  public abstract serialize(unsignedTx: UnsignedTransaction): SerializedSyncProtocolTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTransaction
  // public abstract validateInput(unsignedTx: UnsignedTransaction)
  // public abstract validateOutput(serializedTx: SerializedSyncProtocolTransaction)
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
