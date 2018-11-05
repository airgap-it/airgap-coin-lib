export function toBuffer(rlpArray: any): any {
  if (Array.isArray(rlpArray)) {
    return rlpArray.map(obj => toBuffer(obj))
  }

  if (typeof rlpArray === 'number') {
    return Buffer.from(rlpArray.toString())
  }

  if (typeof rlpArray === 'boolean') {
    return Buffer.from(rlpArray ? '1' : '0')
  }

  return Buffer.from(rlpArray)
}
