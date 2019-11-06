import { RawAeternityTransaction } from './unsigned-transactions/aeternity-transactions.serializer'
import { RawBitcoinTransaction, SerializedUnsignedBitcoinTransaction } from './unsigned-transactions/bitcoin-transactions.serializer'
import { RawEthereumTransaction, SerializedUnsignedEthereumTransaction } from './unsigned-transactions/ethereum-transactions.serializer'
import { RawTezosTransaction, SerializedUnsignedTezosTransaction } from './unsigned-transactions/tezos-transactions.serializer'
import { CosmosTransaction, RLPCosmosTransaction } from '../protocols/cosmos/CosmosTransaction'

export abstract class UnsignedTransactionSerializer {
  public abstract serialize(unsignedTx: UnsignedTransaction): SerializedSyncProtocolTransaction | Promise<SerializedSyncProtocolTransaction>
  public abstract deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTransaction | Promise<UnsignedTransaction>
}

export interface UnsignedTransaction {
  transaction: RawEthereumTransaction | RawBitcoinTransaction | RawAeternityTransaction | RawTezosTransaction | CosmosTransaction
  publicKey: string
  callback?: string
}

export type SerializedUnsignedTransaction =
  | SerializedUnsignedEthereumTransaction
  | SerializedUnsignedBitcoinTransaction
  | SerializedUnsignedTezosTransaction
  | RLPCosmosTransaction

export enum SyncProtocolUnsignedTransactionKeys {
  UNSIGNED_TRANSACTION = 0,
  PUBLIC_KEY = 1,
  CALLBACK = 2
}

export interface SerializedSyncProtocolTransaction extends Array<SerializedUnsignedTransaction | Buffer | Buffer[]> {
  [0]: SerializedUnsignedTransaction // SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION
  [1]: Buffer // SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY
  [2]: Buffer // SyncProtocolUnsignedTransactionKeys.CALLBACK
}
