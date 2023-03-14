import { assertNever, Domain } from '@airgap/coinlib-core'
// @ts-ignore
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { ExtendedPublicKey, ExtendedSecretKey, newExtendedPublicKey, newExtendedSecretKey, PublicKey, SecretKey } from '@airgap/module-kit'

const EXT_SK_PREFIX: string = '0488b21e' // xpriv
const EXT_PK_PREFIX: string = '0488b21e' // xpub

export function convertSecretKey(secretKey: SecretKey, targetFormat: SecretKey['format']): SecretKey {
  if (secretKey.format === targetFormat) {
    return secretKey
  }

  // 'encoded' -> 'hex'
  // 'hex'     -> 'encoded'
  throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported secret key format.')
}

export function convertExtendedSecretKey(
  extendedSecretKey: ExtendedSecretKey,
  targetFormat: ExtendedSecretKey['format']
): ExtendedSecretKey {
  if (extendedSecretKey.format === targetFormat) {
    return extendedSecretKey
  }

  switch (extendedSecretKey.format) {
    case 'encoded':
      if (targetFormat === 'encoded') {
        return extendedSecretKey
      }

      return newExtendedSecretKey(decodeEncodedKey(EXT_SK_PREFIX, extendedSecretKey.value))
    case 'hex':
      if (targetFormat === 'hex') {
        return extendedSecretKey
      }

      return newExtendedSecretKey(encodeHexKey(EXT_SK_PREFIX, extendedSecretKey.value))
    default:
      assertNever(extendedSecretKey.format)
      throw new UnsupportedError(Domain.ETHEREUM, 'Unuspported extended secret key format.')
  }
}

export function convertPublicKey(publicKey: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  // 'encoded' -> 'hex'
  // 'hex'     -> 'encoded'
  throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported public key format.')
}

export function convertExtendedPublicKey(
  extendedPublicKey: ExtendedPublicKey,
  targetFormat: ExtendedPublicKey['format']
): ExtendedPublicKey {
  if (extendedPublicKey.format === targetFormat) {
    return extendedPublicKey
  }

  switch (extendedPublicKey.format) {
    case 'encoded':
      if (targetFormat === 'encoded') {
        return extendedPublicKey
      }

      return newExtendedPublicKey(decodeEncodedKey(EXT_PK_PREFIX, extendedPublicKey.value))
    case 'hex':
      if (targetFormat === 'hex') {
        return extendedPublicKey
      }

      return newExtendedPublicKey(encodeHexKey(EXT_PK_PREFIX, extendedPublicKey.value))
    default:
      assertNever(extendedPublicKey.format)
      throw new UnsupportedError(Domain.ETHEREUM, 'Unuspported extended public key format.')
  }
}

function decodeEncodedKey(prefix: string, key: string): string {
  const prefixBytes: number = Buffer.from(prefix, 'hex').length

  return bs58check.decode(key).slice(prefixBytes).toString('hex')
}

function encodeHexKey(prefix: string, key: string): string {
  return bs58check.encode(Buffer.concat([Buffer.from(prefix, 'hex'), Buffer.from(key, 'hex')]))
}
