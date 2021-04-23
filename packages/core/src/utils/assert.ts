import { ConditionViolationError } from '../errors'
import { Domain } from '../errors/coinlib-error'

export const assertNever: (x: never) => void = (x: never): void => undefined

export function assertFields(name: string, object: any, ...fields: string[]): void {
  fields.forEach((field: string) => {
    if (object[field] === undefined || object[field] === null) {
      throw new ConditionViolationError(Domain.UTILS, `${name}, required: ${fields.join(', ')}, but ${field} is missing.`)
    }
  })
}
