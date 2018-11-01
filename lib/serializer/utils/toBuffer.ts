export function toBuffer(rlpArray: any): any {
  if (Array.isArray(rlpArray)) {
    return rlpArray.map(obj => toBuffer(obj))
  }

  if (typeof rlpArray === 'number') {
    return Buffer.from(rlpArray.toString())
  }

  return Buffer.from(rlpArray)
}
