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

export function hexToBigNumber(hex: string | null, config: { littleEndian: boolean } = { littleEndian: false }): BigNumber {
  if (!hex) {
    return new BigNumber(0)
  }

  const raw = stripHexPrefix(hex)
  return new BigNumber(config.littleEndian ? changeEndianness(raw) : raw, 16)
}

export function changeEndianness(hex: string): string {
  let _hex = stripHexPrefix(hex)
  _hex = _hex.length % 2 != 0 ? '0' + _hex : _hex
  
  const bytes = _hex.match(/.{2}/g) || []

  return bytes.reverse().join('')
}
