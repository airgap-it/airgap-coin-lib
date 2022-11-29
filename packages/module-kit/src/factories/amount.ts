import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { Amount, AmountEnhanced } from '../types/amount'
import { isAmount } from '../utils/amount'

export function newAmount<_Units extends string>(amount: Amount<_Units>): AmountEnhanced<_Units>
export function newAmount<_Units extends string>(amount: number | string | BigNumber, unit: Amount<_Units>['unit']): AmountEnhanced<_Units>
export function newAmount<_Units extends string>(
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
