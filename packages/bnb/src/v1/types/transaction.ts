import {
  EthereumRawUnsignedTransaction,
  EthereumSignedTransaction,
  EthereumTransactionCursor,
  EthereumTypedUnsignedTransaction
} from '@airgap/ethereum/v1'

export type BnbRawUnsignedTransaction = EthereumRawUnsignedTransaction

export type BnbTypedUnsignedTransaction = EthereumTypedUnsignedTransaction

export type BnbUnsignedTransaction = BnbRawUnsignedTransaction | BnbTypedUnsignedTransaction

export type BnbSignedTransaction = EthereumSignedTransaction

export type BnbTransactionCursor = EthereumTransactionCursor
