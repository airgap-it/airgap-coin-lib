// tslint:disable:no-console

import { ICoinProtocol } from '../../packages/core/src'
import { TezosProtocol } from '../../packages/tezos/src'

import { all } from './functions/all'
import { decryptAES } from './functions/decrypt-aes'
import { decryptAsymmetric } from './functions/decrypt-asymmetric'
import { encryptAES } from './functions/encrypt-aes'
import { encryptAsymmetric } from './functions/encrypt-asymmetric'

const mnemonic: string = ''

const protocol: ICoinProtocol = new TezosProtocol()

// Sending values
const recipient: string = 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'
const amount: string = '1'
const fee: string = '1420'

// Unsinged transaction unsigned
const unsignedTx: string =
  '9914719b1dfa36bdbada2eda0a3dc21c5d0b39106e79271546e8bd5563f4b14c6c00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc8c0b8b8239bc5000010000bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc00'

// Signed transaction details
const signedTx: string =
  '05028871c9ea8cb48a5f58c7e8fa3b122d55a52856336b590189aee5abbfff856c00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc8c0b8b8239bc5000010000bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc0028c75a4def99a0a4faff4676526fc1ef9e21c37f20a755c9af1ee02e08fc56b5147de593d2673a2cb532e993b22d68d1f2e8076b5ee7a227e1ce061b3c1eb209'

// Sign message
const message: string = 'this is a message'

all(protocol, mnemonic, recipient, amount, fee, unsignedTx, signedTx, message).catch((error: Error) => {
  console.error('getTransactionDetailsFromSigned', error)
})
;(async () => {
  const encrypted = await encryptAsymmetric(protocol, mnemonic, message)
  const decrypted = await decryptAsymmetric(protocol, mnemonic, encrypted)
  const encryptedAES = await encryptAES(protocol, mnemonic, message)
  const decryptedAES = await decryptAES(protocol, mnemonic, encryptedAES)
})().catch()
