import { SerializedSignedEthereumTransaction } from './signed-transactions/ethereum-transactions.serializer'
import { SerializedSignedBitcoinTransaction } from './signed-transactions/bitcoin-transactions.serializer'
import BigNumber from 'bignumber.js'

export abstract class SignedTransactionSerializer {
  public abstract serialize(unsignedTx: SignedTransaction): SerializedSyncProtocolSignedTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTransaction
}

export interface SignedTransaction {
  transaction: string
  publicKey: string
  from?: string[]
  amount?: BigNumber
  fee?: BigNumber
}

export type SerializedSignedTransaction = SerializedSignedEthereumTransaction | SerializedSignedBitcoinTransaction

export enum SyncProtocolSignedTransactionKeys {
  SIGNED_TRANSACTION,
  PUBLIC_KEY,
  FROM,
  FEE,
  AMOUNT
}

export interface SerializedSyncProtocolSignedTransaction extends Array<SerializedSignedTransaction | Buffer | Buffer[]> {
  [SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION]: SerializedSignedTransaction
  [SyncProtocolSignedTransactionKeys.PUBLIC_KEY]: Buffer
  [SyncProtocolSignedTransactionKeys.FROM]: Buffer[]
  [SyncProtocolSignedTransactionKeys.FEE]: Buffer
  [SyncProtocolSignedTransactionKeys.AMOUNT]: Buffer
}
