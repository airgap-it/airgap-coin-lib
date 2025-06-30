import { Domain } from '@airgap/coinlib-core'
import { InvalidValueError } from '@airgap/coinlib-core/errors'

const TRANSACTION_PREFIX = 'tx_'

export function encodeTx(transaction: string | Buffer): string {
  const base64 = typeof transaction === 'string' ? transaction : Buffer.from(transaction).toString('base64')
  return `${TRANSACTION_PREFIX}${base64}`
}

export function decodeTx(transaction: string): Buffer {
  const encoded = transaction.startsWith(TRANSACTION_PREFIX) ? transaction.slice(TRANSACTION_PREFIX.length) : transaction

  try {
    return Buffer.from(encoded, 'base64')
  } catch {
    throw new InvalidValueError(Domain.STELLAR, 'Invalid Stellar transaction encoding (base64 expected)')
  }
}
