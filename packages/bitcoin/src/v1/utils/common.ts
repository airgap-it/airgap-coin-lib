export function containsSome<T>(needles: T[], haystack: T[]): boolean {
  for (const needle of needles) {
    if (haystack.indexOf(needle) > -1) {
      return true
    }
  }

  return false
}

// This function handles arrays and objects
export function eachRecursive(obj: Object | Object[]) {
  // tslint:disable-next-line: forin
  for (const k in obj) {
    if (Buffer.isBuffer(obj[k])) {
      obj[k] = obj[k].toString('hex')
    }
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      obj[k] = eachRecursive(obj[k])
    }
  }

  return obj
}
