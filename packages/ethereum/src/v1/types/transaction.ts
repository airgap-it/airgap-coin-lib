import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface EthereumRawUnsignedTransaction extends UnsignedTransaction {
  ethereumType: 'raw'
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: number
  data: string
}

export interface EthereumTypedUnsignedTransaction extends UnsignedTransaction {
  ethereumType: 'typed'
  serialized: string
  derivationPath: string
  masterFingerprint: string
}

export type EthereumUnsignedTransaction = EthereumRawUnsignedTransaction | EthereumTypedUnsignedTransaction

export interface EthereumSignedTransaction extends SignedTransaction {
  serialized: string
}

export interface EthereumTransactionCursor extends TransactionCursor {
  page?: number
}
