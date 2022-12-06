import { implementsInterface, Schema } from '@airgap/module-kit/utils/interface'

import { EthereumRawUnsignedTransaction, EthereumTypedUnsignedTransaction, EthereumUnsignedTransaction } from '../types/transaction'

const rawUnsignedTransactionSchema: Schema<EthereumRawUnsignedTransaction> = {
  chainId: 'required',
  data: 'required',
  gasLimit: 'required',
  gasPrice: 'required',
  nonce: 'required',
  to: 'required',
  type: 'required',
  value: 'required'
}

const typedUnsignedTransactionSchema: Schema<EthereumTypedUnsignedTransaction> = {
  derivationPath: 'required',
  masterFingerprint: 'required',
  serialized: 'required',
  type: 'required'
}

export function isRawUnsignedTransaction(transaction: EthereumUnsignedTransaction): transaction is EthereumRawUnsignedTransaction {
  return implementsInterface(transaction, rawUnsignedTransactionSchema)
}

export function isTypedUnsignedTransaction(transaction: EthereumUnsignedTransaction): transaction is EthereumTypedUnsignedTransaction {
  return implementsInterface(transaction, typedUnsignedTransactionSchema)
}
