import { SerializedSignedEthereumTransaction } from './signed-transactions/ethereum-transactions.serializer'
import { SerializedSignedBitcoinTransaction } from './signed-transactions/bitcoin-transactions.serializer'

export abstract class SignedTransactionSerializer {
  public abstract serialize(unsignedTx: SignedTransaction): SerializedSyncProtocolSignedTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTransaction
}

export interface SignedTransaction {
  transaction: string
}

export type SerializedSignedTransaction = SerializedSignedEthereumTransaction | SerializedSignedBitcoinTransaction

export enum SyncProtocolSignedTransactionKeys {
  SIGNED_TRANSACTION,
  PUBLIC_KEY
}

export interface SerializedSyncProtocolSignedTransaction extends Array<SerializedSignedTransaction | Buffer> {
  [SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION]: SerializedSignedTransaction
  [SyncProtocolSignedTransactionKeys.PUBLIC_KEY]: Buffer
}
