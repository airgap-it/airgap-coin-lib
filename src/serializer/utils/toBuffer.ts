import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'

export type RLPData = number | string | boolean | BigNumber | Buffer | RLPData[]

export function toBuffer(rlpArray: RLPData): Buffer | Buffer[] {
  if (Array.isArray(rlpArray)) {
    return rlpArray.map(toBuffer) as Buffer[]
  }

  if (typeof rlpArray === 'number') {
    return Buffer.from(rlpArray.toString())
  }

  if (typeof rlpArray === 'boolean') {
    return Buffer.from(rlpArray ? '1' : '0')
  }

  if (BigNumber.isBigNumber(rlpArray)) {
    return Buffer.from(rlpArray.toFixed())
  }

  if (Buffer.isBuffer(rlpArray)) {
    return rlpArray
  }

  return Buffer.from(rlpArray)
}
