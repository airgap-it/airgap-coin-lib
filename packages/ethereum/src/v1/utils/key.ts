import { assertNever, Domain } from '@airgap/coinlib-core'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { ExtendedPublicKey, ExtendedSecretKey, newExtendedPublicKey, PublicKey, SecretKey } from '@airgap/module-kit'

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

  // 'encoded' -> 'hex'
  // 'hex'     -> 'encoded'
  throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported secret key format.')
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
      return newExtendedPublicKey(convertEncodedExtendedPublicKey(extendedPublicKey.value, targetFormat))
    case 'hex':
      return newExtendedPublicKey(convertHexExtendedPublicKey(extendedPublicKey.value, targetFormat))
    default:
      assertNever(extendedPublicKey.format)
      throw new UnsupportedError(Domain.ETHEREUM, 'Unuspported extended public key format.')
  }
}

function convertEncodedExtendedPublicKey(extendedPublicKey: string, targetFormat: ExtendedPublicKey['format']): string {
  if (targetFormat === 'encoded') {
    return extendedPublicKey
  }

  const prefixBytes: number = Buffer.from(EXT_PK_PREFIX, 'hex').length

  return bs58check.decode(extendedPublicKey).slice(prefixBytes).toString('hex')
}

function convertHexExtendedPublicKey(extendedPublicKey: string, targetFormat: ExtendedPublicKey['format']): string {
  if (targetFormat === 'hex') {
    return extendedPublicKey
  }

  return bs58check.encode(Buffer.concat([Buffer.from(EXT_PK_PREFIX, 'hex'), Buffer.from(extendedPublicKey, 'hex')]))
}
