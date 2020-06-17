export function assertFields(name: string, object: any, ...fields: string[]): void {
  fields.forEach((field: string) => {
    if (object[field] === undefined || object[field] === null) {
      throw new Error(`${name}, required: ${fields.join(', ')}, but ${field} is missing.`)
    }
  })
}

export function assertTypes(name: string, expected: string | string[], _actual?: any | any[]): void {
  const actual = _actual !== undefined ? _actual : []
  
  let actualMatchingExpected: boolean = true

  if (Array.isArray(expected) && Array.isArray(actual)) {
    actualMatchingExpected =
      expected.length === actual.length &&
      actual.map((value: any, index: number) => typeof value === expected[index]).every((predicate: boolean) => predicate)
  } else if (Array.isArray(expected)) {
    actualMatchingExpected = expected.length === 1 && typeof actual === expected[0]
  } else if (Array.isArray(actual)) {
    actualMatchingExpected = actual.length === 1 && typeof actual[0] === expected
  } else {
    actualMatchingExpected = typeof actual === expected
  }

  if (!actualMatchingExpected) {
    const expectedFormatted: string = Array.isArray(expected) ? expected.join(', ') : expected
    const actualFormatted: string = actual.length === 0
      ? '<empty>'
      : actual.map((value: any) => `${value}: ${typeof value}`).join(', ')

    throw new Error(`${name}: expected ${expectedFormatted}, but got ${actualFormatted}`)
  }
}
