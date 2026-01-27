import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumTypedUnsignedTransaction
} from '@airgap/ethereum/v1'

export interface BaseRawUnsignedTransaction extends EthereumRawUnsignedTransaction {
  l1DataFee: string
}

export type BaseTypedUnsignedTransaction = EthereumTypedUnsignedTransaction

export type BaseUnsignedTransaction = BaseRawUnsignedTransaction | BaseTypedUnsignedTransaction

export interface BaseSignedTransaction extends EthereumSignedTransaction {
  l1DataFee?: string
}

export type BaseTransactionCursor = EthereumTransactionCursor
