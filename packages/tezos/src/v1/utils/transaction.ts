import { implementsInterface } from '@airgap/module-kit'

import { TezosSaplingUnsignedTransaction } from '../types/transaction'

function createWatermark(hex: string): Buffer {
  return Buffer.from(hex, 'hex')
}

export const WATERMARK = {
  block: createWatermark('01'),
  endorsement: createWatermark('02'),
  operation: createWatermark('03'),
  message: createWatermark('05')
}

export function isUnsignedSaplingTransaction(transaction: unknown): transaction is TezosSaplingUnsignedTransaction {
  return (
    implementsInterface<TezosSaplingUnsignedTransaction>(transaction, {
      type: 'required',
      ins: 'required',
      outs: 'required',
      contractAddress: 'required',
      chainId: 'required',
      stateDiff: 'required',
      unshieldTarget: 'optional'
    }) && transaction.type === 'unsigned'
  )
}
