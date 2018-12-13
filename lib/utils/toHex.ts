import BigNumber from 'bignumber.js'
import { padStart } from './padStart'

export function toHexBuffer(value: number | BigNumber): Buffer {
  return Buffer.from(toHexString(value), 'hex')
}

export function toHexString(value: number | BigNumber): string {
  return padStart('0x' + value.toString(16), 2, '0')
}
