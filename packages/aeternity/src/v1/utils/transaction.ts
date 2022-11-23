import { Domain } from '@airgap/coinlib-core'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import bs64check from '@airgap/coinlib-core/utils/base64Check'

const TRANSACTION_PREFIX = 'tx_'

export function encodeTx(transaction: any): string {
  return `${TRANSACTION_PREFIX}${bs64check.encode(transaction)}`
}

export function decodeTx(transaction: string): Buffer {
  const encoded = transaction.replace(TRANSACTION_PREFIX, '')

  try {
    return bs64check.decode(encoded)
  } catch (error) {
    //
  }

  try {
    return bs58check.decode(encoded)
  } catch (error) {
    //
  }

  throw new InvalidValueError(Domain.AETERNITY, 'invalid TX-encoding')
}
