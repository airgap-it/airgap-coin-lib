import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { Amount, AmountEnhanced } from '../types/amount'
import { implementsInterface, Schema } from './interface'

const amountSchema: Schema<Amount> = {
  value: 'required',
  unit: 'required'
}

export function isAmount<_Units extends string>(object: unknown): object is Amount<_Units> {
  return implementsInterface(object, amountSchema)
}

export function amount<_Units extends string>(amount: Amount<_Units>): AmountEnhanced<_Units>
export function amount<_Units extends string>(amount: number | string | BigNumber, unit: Amount<_Units>['unit']): AmountEnhanced<_Units>
export function amount<_Units extends string>(
  amount: Amount<_Units> | number | string | BigNumber,
  unitOrUndefined?: Amount<_Units>['unit']
): AmountEnhanced<_Units> {
  if (isAmount<_Units>(amount)) {
    return new AmountEnhanced(amount.value, amount.unit)
  } else {
    const unit: Amount<_Units>['unit'] = unitOrUndefined!

    return new AmountEnhanced(amount, unit)
  }
}
