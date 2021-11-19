export function recursivelyFind<T>(unknownValue: unknown, field: string): T | undefined {
  if (typeof unknownValue !== 'object') {
    return undefined
  }

  const object = unknownValue as Object
  if (object[field]) {
    return object[field]
  }

  const nestedObjects = Object.values(object).filter((value) => typeof value === 'object')
  for (const nested of nestedObjects) {
    const value = recursivelyFind<T>(nested, field)
    if (value) {
      return value
    }
  }

  return undefined
}
