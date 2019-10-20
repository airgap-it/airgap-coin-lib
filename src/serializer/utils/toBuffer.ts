import BigNumber from 'bignumber.js'

export function toBuffer(rlpArray: any, nullOrUndefinedCreatesEmptyBuffer: boolean = false): Buffer | Buffer[] {
  if (Array.isArray(rlpArray)) {
    return rlpArray.map(obj => toBuffer(obj, nullOrUndefinedCreatesEmptyBuffer)) as Buffer[]
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

  return Buffer.from(rlpArray)
}
