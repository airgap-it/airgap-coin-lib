import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'

import { padStart } from './padStart'

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

export function toHexBuffer(value: number | BigNumber, bitLength: number = 8): Buffer {
  return Buffer.from(toHexStringRaw(value, bitLength), 'hex')
}

export function toHexStringRaw(value: number | BigNumber, bitLength: number = 8): string {
  if (new BigNumber(value).isPositive()) {
    return toHexStringRawPositive(value, bitLength)
  } else {
    return toHexStringRawNegative(value, bitLength)
  }
}

export function toHexString(value: number | BigNumber, bitLength: number = 8): string {
  return addHexPrefix(toHexStringRaw(value, bitLength))
}

export function hexToBytes(hex: string | Uint8Array | Buffer, bitLength?: number): Buffer {
  const byteLength: number | undefined = bitLength !== undefined ? Math.ceil(bitLength / 8) : undefined

  let buffer: Buffer
  if (typeof hex === 'string' && isHex(hex)) {
    buffer = Buffer.from(stripHexPrefix(hex), 'hex')
  } else if (!(typeof hex === 'string')) {
    buffer = Buffer.from(hex)
  } else {
    buffer = Buffer.from([0])
  }

  if (byteLength !== undefined && buffer.length < byteLength) {
    const newBuffer = Buffer.alloc(byteLength, 0)

    const offset = newBuffer.length - buffer.length
    buffer.copy(newBuffer, offset)

    return newBuffer
  } else {
    return buffer
  }
}

export function bytesToHex(bytes: Uint8Array | Buffer | string, config?: { withPrefix: boolean }): string {
  let hex: string
  if (typeof bytes === 'string') {
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

function toHexStringRawPositive(value: number | BigNumber, bitLength: number): string {
  const nibbleLength: number = Math.ceil(bitLength / 4)
  const hexString: string = value.toString(16)

  let targetLength: number = hexString.length >= nibbleLength ? hexString.length : nibbleLength
  targetLength = targetLength % 2 == 0 ? targetLength : targetLength + 1

  return padStart(hexString, targetLength, '0')
}

function toHexStringRawNegative(value: number | BigNumber, bitLength: number): string {
  const value2sComplement: BigNumber = new BigNumber(2).pow(bitLength).minus(new BigNumber(value).abs())

  return value2sComplement.toString(16)
}
