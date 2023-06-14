import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumTypedUnsignedTransaction
} from '@airgap/ethereum/v1'

export interface OptimismRawUnsignedTransaction extends EthereumRawUnsignedTransaction {
  l1DataFee: string
}

export type OptimismTypedUnsignedTransaction = EthereumTypedUnsignedTransaction

export type OptimismUnsignedTransaction = OptimismRawUnsignedTransaction | OptimismTypedUnsignedTransaction

export interface OptimismSignedTransaction extends EthereumSignedTransaction {
  l1DataFee?: string
}

export type OptimismTransactionCursor = EthereumTransactionCursor
