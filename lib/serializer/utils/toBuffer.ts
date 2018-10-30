export function toBuffer(rlpArray: any): any {
  if (Array.isArray(rlpArray)) {
    return rlpArray.map(obj => toBuffer(obj))
  }

  return Buffer.from(rlpArray)
}
