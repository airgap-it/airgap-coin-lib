import { EncodedType } from './serializer'
import {
  SerializedUnsignedEthereumTransaction,
  EthereumUnsignedTransactionSerializer,
  RawEthereumTransaction
} from './transactions/ethereum-transactions.serializer'
import BigNumber from 'bignumber.js'

const implementedSerializers = {
  eth: EthereumUnsignedTransactionSerializer
}

export function serializerByProtocolIdentifier(protocolIdentifier: string): TransactionSerializer {
  const protocol = Object.keys(implementedSerializers).find(protocol => protocol.startsWith(protocolIdentifier))

  if (!protocol) {
    throw Error('no compatible protocol registered.')
  }

  return new implementedSerializers[protocol]()
}

export abstract class TransactionSerializer {
  public abstract serialize(...args: any): SerializedSyncProtocolTransaction
  public abstract deserialize(serializedTx: SerializedSyncProtocolTransaction): UnsignedTransaction
}

export interface UnsignedTransaction {
  transaction: RawEthereumTransaction
  from: string
  to: string
  amount: BigNumber
  fee: BigNumber
  publicKey: string
}

export type SerializedUnsignedTransaction = SerializedUnsignedEthereumTransaction

export enum SyncProtocolUnsignedTransactionKeys {
  UNSIGNED_TRANSACTION,
  FROM,
  TO,
  AMOUNT,
  FEE,
  PUBLIC_KEY
}

export interface SerializedSyncProtocolTransaction
  extends Array<boolean | number | SerializedUnsignedTransaction | string | EncodedType | string[]> {
  [SyncProtocolUnsignedTransactionKeys.UNSIGNED_TRANSACTION]: SerializedUnsignedTransaction
  [SyncProtocolUnsignedTransactionKeys.FROM]: string
  [SyncProtocolUnsignedTransactionKeys.TO]: string[]
  [SyncProtocolUnsignedTransactionKeys.AMOUNT]: string[]
  [SyncProtocolUnsignedTransactionKeys.FEE]: string
  [SyncProtocolUnsignedTransactionKeys.PUBLIC_KEY]: string
}
