import { assertNever, Domain } from '@airgap/coinlib-core'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2'
import { ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  ExtendedPublicKey,
  ExtendedSecretKey,
  newExtendedPublicKey,
  newExtendedSecretKey,
  newPublicKey,
  newSecretKey,
  PublicKey,
  SecretKey
} from '@airgap/module-kit'

import {
  BitcoinExtendedPublicKeyEncoding,
  BitcoinSegwitExtendedPublicKeyEncoding,
  BitcoinTestnetExtendedPublicKeyEncoding
} from '../types/key'

const EXT_PK_PREFIX: Record<BitcoinExtendedPublicKeyEncoding, string> = {
  xpub: '0488b21e'
}

const EXT_PK_TESTNET_PREFIX: Record<BitcoinTestnetExtendedPublicKeyEncoding, string> = {
  tpub: '043587cf'
}

const EXT_PK_SEGWIT_PREFIX: Record<BitcoinSegwitExtendedPublicKeyEncoding, string> = {
  xpub: '0488b21e',
  ypub: '049d7cb2',
  zpub: '04b24746'
}

type ExtendedPublicKeyEncoding<E extends string> = E extends BitcoinExtendedPublicKeyEncoding
  ? typeof EXT_PK_PREFIX
  : E extends BitcoinTestnetExtendedPublicKeyEncoding
  ? typeof EXT_PK_TESTNET_PREFIX
  : E extends BitcoinSegwitExtendedPublicKeyEncoding
  ? typeof EXT_PK_SEGWIT_PREFIX
  : never

const extendedPublicKeyPrefixes: Record<string, string>[] = [EXT_PK_PREFIX, EXT_PK_TESTNET_PREFIX, EXT_PK_SEGWIT_PREFIX]
const extendedPublicKeyEncodings: string[] = extendedPublicKeyPrefixes.reduce((acc, next) => acc.concat(Object.keys(next)), [] as string[])

export function convertSecretKey(secretKey: SecretKey, targetFormat: SecretKey['format']): SecretKey {
  if (secretKey.format === targetFormat) {
    return secretKey
  }

  switch (secretKey.format) {
    case 'encoded':
      throw new UnsupportedError(Domain.BITCOIN, `Unsupported secret key format ${secretKey.format}.`)
    case 'hex':
      return newSecretKey(convertHexSecretKey(secretKey.value, targetFormat))
    default:
      assertNever(secretKey.format)
      throw new UnsupportedError(Domain.BITCOIN, 'Unuspported secret key format.')
  }
}

function convertHexSecretKey(secretKey: string, targetFormat: SecretKey['format']): string {
  if (targetFormat === 'hex') {
    return secretKey
  }

  throw new UnsupportedError(Domain.BITCOIN, `Unsupported secret key format ${targetFormat}.`)
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
      return newExtendedSecretKey(convertEncodedExtendedSecretKey(extendedSecretKey.value, targetFormat))
    case 'hex':
      throw new UnsupportedError(Domain.BITCOIN, `Unsupported extended secret key format ${extendedSecretKey.format}.`)
    default:
      assertNever(extendedSecretKey.format)
      throw new UnsupportedError(Domain.BITCOIN, 'Unuspported extended secret key format.')
  }
}

function convertEncodedExtendedSecretKey(extendedSecretKey: string, targetFormat: ExtendedSecretKey['format']): string {
  if (targetFormat === 'encoded') {
    return extendedSecretKey
  }

  throw new UnsupportedError(Domain.BITCOIN, `Unsupported extended secret key format ${targetFormat}.`)
}

export function convertPublicKey(publicKey: PublicKey, targetFormat: PublicKey['format']): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey
  }

  switch (publicKey.format) {
    case 'encoded':
      throw new UnsupportedError(Domain.BITCOIN, `Unsupported public key format ${publicKey.format}.`)
    case 'hex':
      return newPublicKey(convertHexPublicKey(publicKey.value, targetFormat))
    default:
      assertNever(publicKey.format)
      throw new UnsupportedError(Domain.BITCOIN, 'Unuspported public key format.')
  }
}

function convertHexPublicKey(pk: string, targetFormat: PublicKey['format']): string {
  if (targetFormat === 'hex') {
    return pk
  }

  throw new UnsupportedError(Domain.BITCOIN, `Unsupported public key format ${targetFormat}.`)
}

type ConvertExtendedPublicKeyTarget<Encoding extends string> =
  | { format: Exclude<ExtendedPublicKey['format'], 'encoded'> }
  | { format: Extract<ExtendedPublicKey['format'], 'encoded'>; type: Encoding }

export function convertExtendedPublicKey<Encoding extends string>(
  extendedPublicKey: ExtendedPublicKey,
  target: ConvertExtendedPublicKeyTarget<Encoding>
): ExtendedPublicKey {
  switch (extendedPublicKey.format) {
    case 'encoded':
      return newExtendedPublicKey(convertEncodedExtendedPublicKey(extendedPublicKey.value, target))
    case 'hex':
      return newExtendedPublicKey(convertHexExtendedPublicKey(extendedPublicKey.value, target))
    default:
      assertNever(extendedPublicKey.format)
      throw new UnsupportedError(Domain.BITCOIN, 'Unuspported extended public key format.')
  }
}

function convertEncodedExtendedPublicKey<Encoding extends string>(
  extendedPublicKey: string,
  target: ConvertExtendedPublicKeyTarget<Encoding>
): string {
  if (target.format === 'encoded' && extendedPublicKey.startsWith(target.type)) {
    return extendedPublicKey
  }

  switch (target.format) {
    case 'encoded':
      const hexExtendedPublicKey: string = convertEncodedExtendedPublicKey(extendedPublicKey, { format: 'hex' })

      return convertHexExtendedPublicKey(hexExtendedPublicKey, target)
    case 'hex':
      const prefix: string | undefined = extendedPublicKeyEncodings.find((prefix: string) => extendedPublicKey.startsWith(prefix))
      if (prefix === undefined) {
        throw new ConditionViolationError(Domain.BITCOIN, 'Unsupported encoded extended public key.')
      }
      const encoding: ExtendedPublicKeyEncoding<Encoding> = recognizeExtendedPublicKeyEncoding(prefix)
      const prefixBytes: number = Buffer.from(encoding[prefix], 'hex').length

      return bs58check.decode(extendedPublicKey).slice(prefixBytes).toString('hex')
    default:
      assertNever(target)
      throw new UnsupportedError(Domain.BITCOIN, 'Unsupported extended public key format.')
  }
}

function convertHexExtendedPublicKey<Encoding extends string>(
  extendedPublicKey: string,
  target: ConvertExtendedPublicKeyTarget<Encoding>
): string {
  if (target.format === 'hex') {
    return extendedPublicKey
  }

  const encoding: ExtendedPublicKeyEncoding<Encoding> = recognizeExtendedPublicKeyEncoding(target.type)
  const prefix: string = encoding[target.type as any]

  return bs58check.encode(Buffer.concat([Buffer.from(prefix, 'hex'), Buffer.from(extendedPublicKey, 'hex')]))
}

function recognizeExtendedPublicKeyEncoding<Encoding extends string>(type: Encoding): ExtendedPublicKeyEncoding<Encoding> {
  const candidates: Record<string, string>[] = extendedPublicKeyPrefixes
  const encoding: Record<string, string> | undefined = candidates.find((candidate: Record<string, string>) =>
    Object.keys(candidate).includes(type)
  )
  if (encoding === undefined) {
    throw new UnsupportedError(Domain.BITCOIN, 'Unsupported extended public key encoding,')
  }

  return encoding as ExtendedPublicKeyEncoding<Encoding>
}
