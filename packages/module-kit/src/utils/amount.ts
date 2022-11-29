import { Amount } from '../types/amount'

import { implementsInterface, Schema } from './interface'

const amountSchema: Schema<Amount> = {
  value: 'required',
  unit: 'required'
}

export function isAmount<_Units extends string>(object: unknown): object is Amount<_Units> {
  return implementsInterface(object, amountSchema)
}
