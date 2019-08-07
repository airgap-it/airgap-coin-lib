// tslint:disable:no-console

import * as sodium from 'libsodium-wrappers'

import { TezosProtocol } from '../src'

// signMessage will be included in the airgap-coin-lib in a later release
const signMessage: (message: string, privateKey: Buffer) => Promise<string> = async (
  message: string,
  privateKey: Buffer
): Promise<string> => {
  await sodium.ready
  const signature: Uint8Array = sodium.crypto_sign_detached(sodium.from_string(message), privateKey)
  const hexSignature: string = Buffer.from(signature).toString('hex')

  return hexSignature
}

// verifyMessage will be included in the airgap-coin-lib in a later release
const verifyMessage: (message: string, hexSignature: string, publicKey: Buffer) => Promise<boolean> = async (
  message: string,
  hexSignature: string,
  publicKey: Buffer
): Promise<boolean> => {
  await sodium.ready
  const signature: Uint8Array = new Uint8Array(Buffer.from(hexSignature, 'hex'))
  const isValidSignature: boolean = sodium.crypto_sign_verify_detached(signature, message, publicKey)

  return isValidSignature
}

const seed: string =
  '84428e650701fe0803103696c191b91ac279007aa2687c82b518ac2a833e65095037d0f89f585a4946739164e7e407f664d53ff1329d1066025247f15a1f5183'
const standardDerivationPath: string = `m/44h/457h/0h/0h/0h`
const protocol: TezosProtocol = new TezosProtocol()

const argPrivateKey: Buffer = protocol.getPrivateKeyFromHexSecret(seed, standardDerivationPath)
const argPublicKey: Buffer = Buffer.from(protocol.getPublicKeyFromHexSecret(seed, standardDerivationPath), 'hex')

const argMessage: string = 'This message will be signed.'

signMessage(argMessage, argPrivateKey)
  .then((signedMessage: string) => {
    console.log('signature', signedMessage)

    verifyMessage(argMessage, signedMessage, argPublicKey)
      .then((isValid: boolean) => {
        console.log('Signature is valid: ', isValid)
      })
      .catch((error: Error) => {
        console.error('BAKER_INFO ERROR:', error)
      })
  })
  .catch((error: Error) => {
    console.error('BAKER_INFO ERROR:', error)
  })
