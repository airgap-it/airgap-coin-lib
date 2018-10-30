import BigNumber from 'bignumber.js'

export function toHexBuffer(value: number | BigNumber): Buffer {
  return Buffer.from(toHexString(value), 'hex')
}

export function toHexString(value: number | BigNumber): string {
  return '0x' + value.toString(16).padStart(2, '0')
}
