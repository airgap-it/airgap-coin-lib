// tslint:disable:no-console

import { ICoinProtocol } from '../../../packages/core/src'

import { getTransactionDetails, getTransactionDetailsFromSigned } from './get-transaction-details'
import { send } from './send-transaction'
import { sign } from './sign-message'
import { verify } from './verify-message'

export const all: (
  protocol: ICoinProtocol,
  mnemonic: string,
  recipient: string,
  amount: string,
  fee: string,
  unsignedTx: string,
  signedTx: string,
  message: string
) => Promise<void> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  recipient: string,
  amount: string,
  fee: string,
  unsignedTx: string,
  signedTx: string,
  message: string
): Promise<void> => {
  // Send
  send(protocol, mnemonic, recipient, amount, fee).catch((error: Error) => {
    console.error('Sending error', error)
  })

  // Sign and verify
  ;(async (): Promise<void> => {
    const signature: string = await sign(protocol, mnemonic, message)
    await verify(protocol, mnemonic, message, signature)
  })().catch((error: Error) => {
    console.error('Sign and verify error', error)
  })

  // Unsigned Transaction
  getTransactionDetails(protocol, unsignedTx).catch((error: Error) => {
    console.error('getTransactionDetails', error)
  })

  // Signed Transaction
  getTransactionDetailsFromSigned(protocol, signedTx).catch((error: Error) => {
    console.error('getTransactionDetailsFromSigned', error)
  })
}
