import BigNumber from '../dependencies/src/bignumber.js-9.0.0/bignumber'

import { padStart } from './padStart'

export function toHexBuffer(value: number | BigNumber): Buffer {
  return Buffer.from(toHexString(value), 'hex')
}

export function toHexString(value: number | BigNumber): string {
  return '0x' + padStart(value.toString(16), 2, '0')
}
