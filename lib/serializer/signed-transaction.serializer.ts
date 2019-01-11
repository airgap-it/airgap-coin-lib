import { SerializedSignedEthereumTransaction } from './signed-transactions/ethereum-transactions.serializer'
import { SerializedSignedBitcoinTransaction } from './signed-transactions/bitcoin-transactions.serializer'
import BigNumber from 'bignumber.js'
import { SerializedSignedAeternityTransaction } from './signed-transactions/aeternity-transactions.serializer'
import { SerializedSignedTezosTransaction } from './signed-transactions/tezos-transactions.serializer'

export abstract class SignedTransactionSerializer {
  public abstract serialize(unsignedTx: SignedTransaction): SerializedSyncProtocolSignedTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolSignedTransaction): SignedTransaction
}

export interface SignedTransaction {
  transaction: string
  accountIdentifier: string
  from?: string[]
  amount?: BigNumber
  to?: string[]
  fee?: BigNumber
}

export type SerializedSignedTransaction =
  | SerializedSignedEthereumTransaction
  | SerializedSignedBitcoinTransaction
  | SerializedSignedAeternityTransaction
  | SerializedSignedTezosTransaction

export enum SyncProtocolSignedTransactionKeys {
  SIGNED_TRANSACTION = 0,
  ACCOUNT_IDENTIFIER = 1,
  FROM = 2,
  FEE = 3,
  AMOUNT = 4,
  TO = 5
}

export interface SerializedSyncProtocolSignedTransaction extends Array<SerializedSignedTransaction | Buffer | Buffer[]> {
  [0]: SerializedSignedTransaction // SyncProtocolSignedTransactionKeys.SIGNED_TRANSACTION
  [1]: Buffer // SyncProtocolSignedTransactionKeys.ACCOUNT_IDENTIFIER
  [2]: Buffer[] // SyncProtocolSignedTransactionKeys.FROM
  [3]: Buffer // SyncProtocolSignedTransactionKeys.FEE
  [4]: Buffer // SyncProtocolSignedTransactionKeys.AMOUNT
  [5]: Buffer[] // SyncProtocolSignedTransactionKeys.TO
}
