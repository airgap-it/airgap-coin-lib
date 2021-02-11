export function invalidArgumentTypeError(name: string, expected: string, actual: string): Error {
  return new Error(`${name}: expected ${expected} but got ${actual}.`)
}