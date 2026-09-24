/**
 * Minimal `secp256k1`-package-compatible surface on top of the vendored, noble-backed
 * `@bitcoinerlab/secp256k1` (the same implementation the Bitcoin protocols sign with).
 *
 * Replaces the npm `secp256k1` dependency, which was a native addon with an `elliptic` fallback.
 * Only the functions used by `hdkey.ts` and `secp256k1.ts` are provided, with the same argument
 * order and defaults as the npm package (compressed output by default, throwing on invalid input).
 *
 * Signatures are RFC 6979 deterministic with low-S normalisation in both implementations, so the
 * bytes produced by `ecdsaSign` are unchanged; `ecdsaVerify` keeps the npm package's strict low-S
 * requirement.
 */
import * as ecc from '@airgap/coinlib-core/dependencies/src/@bitcoinerlab/secp256k1-1.2.0/src/index'

export function privateKeyVerify(privateKey: Uint8Array): boolean {
  return ecc.isPrivate(privateKey)
}

export function publicKeyCreate(privateKey: Uint8Array, compressed: boolean = true): Uint8Array {
  const publicKey: Uint8Array | null = ecc.pointFromScalar(privateKey, compressed)
  if (publicKey === null) {
    throw new Error('Private Key is invalid')
  }

  return publicKey
}

export function publicKeyVerify(publicKey: Uint8Array): boolean {
  return ecc.isPoint(publicKey)
}

export function publicKeyConvert(publicKey: Uint8Array, compressed: boolean = true): Uint8Array {
  return ecc.pointCompress(publicKey, compressed)
}

export function privateKeyTweakAdd(privateKey: Uint8Array, tweak: Uint8Array): Uint8Array {
  const result: Uint8Array | null = ecc.privateAdd(privateKey, tweak)
  if (result === null) {
    throw new Error('The tweak was out of range or the resulted private key is invalid')
  }

  return result
}

export function publicKeyTweakAdd(publicKey: Uint8Array, tweak: Uint8Array, compressed: boolean = true): Uint8Array {
  const result: Uint8Array | null = ecc.pointAddScalar(publicKey, tweak, compressed)
  if (result === null) {
    throw new Error('The tweak was out of range or the resulted public key is invalid')
  }

  return result
}

export function ecdsaSign(message: Uint8Array, privateKey: Uint8Array): { signature: Uint8Array; recid: number } {
  const { signature, recoveryId } = ecc.signRecoverable(message, privateKey, undefined)

  return { signature, recid: recoveryId }
}

export function ecdsaVerify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
  return ecc.verify(message, publicKey, signature, true)
}
