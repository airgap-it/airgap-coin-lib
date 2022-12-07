import { BitcoinSignedTransaction, BitcoinTransactionCursor, BitcoinUnsignedTransaction } from '@airgap/bitcoin/v1'

export interface GroestlcoinUnsignedTransaction extends BitcoinUnsignedTransaction {}
export interface GroestlcoinSignedTransaction extends BitcoinSignedTransaction {}

export interface GroestlcoinTransactionCursor extends BitcoinTransactionCursor {}
