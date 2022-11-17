import { HasConfigurableContract } from '../protocols/HasConfigurableContract'

export function implementsInterface<T>(object: unknown, schema: Record<keyof T, 'required' | 'optional'>): object is T {
  if (typeof object !== 'object' || !object) {
    return false
  }

  return Object.keys(schema).every((key) => schema[key] === 'optional' || object[key] !== undefined)
}

export function hasConfigurableContract(object: unknown): object is HasConfigurableContract {
  return implementsInterface<HasConfigurableContract>(object, {
    getContractAddress: 'required',
    setContractAddress: 'required'
  })
}
