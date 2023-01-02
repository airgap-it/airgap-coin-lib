import { Domain } from '@airgap/coinlib-core'
import BigInt = require('@airgap/coinlib-core/dependencies/src/big-integer-1.6.45/BigInteger')
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { ConditionViolationError, OperationFailedError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { hexToBytes, stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { hash } from '@stablelib/blake2b'

import { MichelsonList } from '../types/michelson/generics/MichelsonList'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonType } from '../types/michelson/MichelsonType'
import { MichelsonTypeUtils } from '../types/michelson/MichelsonTypeUtils'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'

import { decodeBase58, encodeBase58 } from './encoding'
import { WATERMARK } from './transaction'

export function parseAddress(bytes: string | Buffer): string {
  let rawHexAddress: string = typeof bytes === 'string' ? bytes : bytes.toString('hex')

  if (rawHexAddress.startsWith('0x')) {
    rawHexAddress = rawHexAddress.slice(2)
  }
  const { result, rest }: { result: string; rest: string } = splitAndReturnRest(rawHexAddress, 2)
  const contractIdTag: string = result
  if (contractIdTag === '00') {
    // tz address
    return parseTzAddress(rest)
  } else if (contractIdTag === '01') {
    // kt address
    return encodeBase58(rest.slice(0, -2), 'contextHash')
  } else {
    throw new UnsupportedError(Domain.TEZOS, `address format not supported (${rawHexAddress})`)
  }
}

export function encodeAddress(address: string): Buffer {
  if (address.startsWith('tz')) {
    // tz address
    return Buffer.concat([Buffer.from([0]), encodeTzAddress(address)])
  } else if (address.startsWith('KT')) {
    // kt address
    return Buffer.concat([Buffer.from([1]), decodeBase58(address, 'contextHash')])
  } else {
    throw new Error(`address format not supported (${address})`)
  }
}

export function packMichelsonType(type: MichelsonType): string {
  return `${WATERMARK.message}${type.encode().toString('hex')}`
}

export function unpackMichelsonType(encoded: string): MichelsonType {
  const bytes: Buffer = hexToBytes(encoded)
  const watermarkBytes: Buffer = hexToBytes(WATERMARK.message)
  const prefix: Buffer = bytes.slice(0, watermarkBytes.length)
  if (!prefix.equals(watermarkBytes)) {
    throw new ConditionViolationError(Domain.TEZOS, 'Invalid packed MichelsonType.')
  }

  const michelsonType: MichelsonType | undefined = MichelsonTypeUtils.decode(bytes.slice(prefix.length))
  if (michelsonType === undefined) {
    throw new ConditionViolationError(Domain.TEZOS, 'Could not unpack encoded MichelsonType.')
  }

  return michelsonType
}

export function parseHex(rawHex: string | string[]): MichelsonType {
  let hex: string[]
  if (typeof rawHex === 'string') {
    hex = hexStringToArray(rawHex)
  } else {
    hex = rawHex
  }
  const type = hex.shift()
  switch (type) {
    case '07': // prim
      const primType = hex.shift()
      if (primType === MichelsonTypeUtils.primPrefixes.pair.toString('hex')) {
        return parsePair(hex)
      }
      throw new UnsupportedError(Domain.TEZOS, 'Prim type not supported')
    case MichelsonTypeUtils.literalPrefixes.int.toString('hex'):
      const intBytes: string[] = []
      let byte: string | undefined
      do {
        byte = hex.shift()
        if (byte === undefined) {
          break
        }
        intBytes.push(byte)
      } while (parseInt(byte, 16) >= 127)

      return MichelsonInt.from(decodeSignedInt(intBytes.join('')))
    case MichelsonTypeUtils.literalPrefixes.string.toString('hex'):
      const stringLength = hexToLength(hex.splice(0, 4))

      return MichelsonString.from(hexToString(hex.splice(0, stringLength)))
    case '05': // single arg prim
      return parseHex(hex)
    case MichelsonTypeUtils.sequencePrefixes.list.toString('hex'):
      return parseList(hex)
    case MichelsonTypeUtils.literalPrefixes.bytes.toString('hex'):
      const bytesLength = hexToLength(hex.splice(0, 4))

      return MichelsonBytes.from(hex.splice(0, bytesLength).join(''))
    default:
      throw new UnsupportedError(Domain.TEZOS, `Type not supported ${type}`)
  }
}

export async function encodeExpr(value: MichelsonType): Promise<string> {
  const packed: Buffer = Buffer.from(packMichelsonType(value), 'hex')
  const hashBytes: Uint8Array = hash(packed, 32)

  return encodeBase58(hashBytes, 'scriptExprHash')
}

function decodeSignedInt(hex: string): BigNumber {
  const positive = Buffer.from(hex.slice(0, 2), 'hex')[0] & 0x40 ? false : true
  const arr = Buffer.from(hex, 'hex').map((v, i) => (i === 0 ? v & 0x3f : v & 0x7f))
  let n = BigInt.zero
  for (let i = arr.length - 1; i >= 0; i--) {
    if (i === 0) {
      n = n.or(arr[i])
    } else {
      n = n // .or(bigInt(arr[i]).shiftLeft(7 * i - 1))
    }
  }

  return new BigNumber(positive ? n.toString() : n.negate().toString())
}

function hexStringToArray(hexString: string): string[] {
  const hexBytes: RegExpMatchArray | null = stripHexPrefix(hexString).match(/.{2}/g)
  if (hexBytes === null) {
    throw new OperationFailedError(Domain.TEZOS, 'Cannot parse contract code')
  }

  return hexBytes
}

function parsePair(hex: string[]): MichelsonPair {
  const first = parseHex(hex)
  const second = parseHex(hex)

  return MichelsonPair.from([first, second])
}

function parseList(hex: string[]): MichelsonList {
  const items: MichelsonType[] = []
  const lengthBytes = hexToLength(hex.splice(0, 4))
  if (lengthBytes > 0) {
    const listBytes = hex.splice(0, lengthBytes)
    while (listBytes.length > 0) {
      const item = parseHex(listBytes)
      items.push(item)
    }
  }

  return MichelsonList.from(items)
}

function hexToString(hex: string[]): string {
  return hex.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('')
}

function hexToLength(hex: string[]): number {
  const stringValue = hex.reduce((previous, next) => {
    if (next === '00') {
      return previous
    }

    return `${previous}${next}`
  }, '')

  if (stringValue.length > 0) {
    return parseInt(stringValue, 16)
  }

  return 0
}

function splitAndReturnRest(payload: string, length: number): { result: string; rest: string } {
  const result: string = payload.substr(0, length)
  const rest: string = payload.substr(length, payload.length - length)

  return { result, rest }
}

export function parseTzAddress(bytes: string | Buffer): string {
  const rawHexAddress: string = typeof bytes === 'string' ? bytes : bytes.toString('hex')

  // tz1 address
  const { result, rest }: { result: string; rest: string } = splitAndReturnRest(rawHexAddress, 2)
  const publicKeyHashTag: string = result
  switch (publicKeyHashTag) {
    case '00':
      return encodeBase58(rest, 'ed25519PublicKeyHash')
    case '01':
      return encodeBase58(rest, 'secp256K1PublicKeyHash')
    case '02':
      return encodeBase58(rest, 'p256PublicKeyHash')
    default:
      throw new UnsupportedError(Domain.TEZOS, `address format not supported (${rawHexAddress})`)
  }
}

export function encodeTzAddress(address: string): Buffer {
  if (address.startsWith('tz1')) {
    return Buffer.concat([Buffer.from([0]), decodeBase58(address, 'ed25519PublicKeyHash')])
  } else if (address.startsWith('tz2')) {
    return Buffer.concat([Buffer.from([1]), decodeBase58(address, 'secp256K1PublicKeyHash')])
  } else if (address.startsWith('tz3')) {
    return Buffer.concat([Buffer.from([2]), decodeBase58(address, 'p256PublicKeyHash')])
  } else {
    throw new Error(`address format not supported (${address})`)
  }
}
