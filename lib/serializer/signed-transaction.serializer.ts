import { SerializedSignedEthereumTransaction } from './signed-transactions/ethereum-transactions.serializer'
import { SerializedSignedBitcoinTransaction } from './signed-transactions/bitcoin-transactions.serializer'
import BigNumber from 'bignumber.js'
import { SerializedSignedAeternityTransaction } from './signed-transactions/aeternity-transactions.serializer'

export abstract class SignedTransactionSerializer {
  public abstract serialize(unsignedTx: SignedTransaction): SerializedSyncProtocolSignedTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTransaction
}

export interface SignedTransaction {
  transaction: string
  accountIdentifier: string
  from?: string[]
  amount?: BigNumber
  fee?: BigNumber
}

export type SerializedSignedTransaction =
  | SerializedSignedEthereumTransaction
  | SerializedSignedBitcoinTransaction
  | SerializedSignedAeternityTransaction

export enum SyncProtocolSignedTransactionKeys {
  SIGNED_TRANSACTION,
  ACCOUNT_IDENTIFIER,
  FROM,
  FEE,
  AMOUNT
}

export interface SerializedSyncProtocolSignedTransaction extends Array<SerializedSignedTransaction | Buffer | Buffer[]> {
  [SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION]: SerializedSignedTransaction
  [SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER]: Buffer
  [SyncProtocolSignedTransactionKeys.FROM]: Buffer[]
  [SyncProtocolSignedTransactionKeys.FEE]: Buffer
  [SyncProtocolSignedTransactionKeys.AMOUNT]: Buffer
}
