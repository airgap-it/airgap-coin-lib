import { SerializedUnsignedEthereumTransaction, RawEthereumTransaction } from './unsigned-transactions/ethereum-transactions.serializer'
import { RawBitcoinTransaction, SerializedUnsignedBitcoinTransaction } from './unsigned-transactions/bitcoin-transactions.serializer'
import { RawAeternityTransaction } from './unsigned-transactions/aeternity-transactions.serializer'

export abstract class UnsignedTransactionSerializer {
  public abstract serialize(unsignedTx: UnsignedTransaction): SerializedSyncProtocolTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTransaction
}

export interface UnsignedTransaction {
  transaction: RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction
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
  [0]: SerializedUnsignedTransaction // SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION
  [1]: Buffer // SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY
  [2]: Buffer // SyncProtocolUnsignedTransactionKeys.CALLBACK
}
