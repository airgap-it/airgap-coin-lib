import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'

import { padStart } from './padStart'
import { isString } from 'util'

const HEX_PREFIX = '0x'
const HEX_REGEX = new RegExp(`^(${HEX_PREFIX})?[0-9a-fA-F]*$`)

function hasPrefix(value: string): boolean {
  return value.startsWith(HEX_PREFIX)
}

export function addHexPrefix(raw: string): string {
  return hasPrefix(raw) ? raw : HEX_PREFIX + raw
}

export function stripHexPrefix(hex: string): string {
  return hasPrefix(hex) ? hex.substring(2) : hex
}

export function isHex(value: string): boolean {
  return HEX_REGEX.test(value)
}

export function toHexBuffer(value: number | BigNumber): Buffer {
  return Buffer.from(toHexStringRaw(value), 'hex')
}

export function toHexStringRaw(value: number | BigNumber, bitLength: number = 8): string {
  const nibbleLength = Math.ceil(bitLength / 4)
  const hexString = value.toString(16)

  let targetLength = hexString.length >= nibbleLength ? hexString.length : nibbleLength
  targetLength = targetLength % 2 == 0 ? targetLength : targetLength + 1
  
  return padStart(value.toString(16), targetLength, '0')
}

export function toHexString(value: number | BigNumber, bitLength: number = 8): string {
  return addHexPrefix(toHexStringRaw(value, bitLength))
}

export function hexToBytes(hex: string | Uint8Array | Buffer): Buffer {
  if (isString(hex) && isHex(hex)) {
    return Buffer.from(stripHexPrefix(hex), 'hex')
  } else if (!isString(hex)) {
    return Buffer.from(hex)
  } else {
    return Buffer.from([0])
  }
}

export function bytesToHex(bytes: Uint8Array | Buffer | string, config?: { withPrefix: boolean }): string {
  let hex: string
  if (isString(bytes)) {
    hex = bytes
  } else {
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
    hex = buffer.toString('hex')
  }
  return config?.withPrefix ? addHexPrefix(hex) : hex
}

export function changeEndianness(hex: string): string {
  let _hex = stripHexPrefix(hex)
  _hex = _hex.length % 2 != 0 ? '0' + _hex : _hex
  
  const bytes = _hex.match(/.{2}/g) || []

  return bytes.reverse().join('')
}
