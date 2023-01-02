import { Address } from '../../../types/address'
import { Balance } from '../../../types/balance'
import { AirGapTransactionsWithCursor } from '../../../types/transaction'
import { _OnlineProtocol, OnlineGeneric } from '../../protocol'

export type FetchDataForAddressExtension<T extends _OnlineProtocol> = T extends _OnlineProtocol<
  any,
  any,
  any,
  infer _Units,
  infer _FeeUnits,
  any,
  any,
  any,
  infer _TransactionCursor,
  any,
  infer _BalanceConfiguration
>
  ? FetchDataForAddressProtocol<_Units, _FeeUnits, _TransactionCursor, _BalanceConfiguration>
  : never

export interface FetchDataForAddressProtocol<
  _Units extends OnlineGeneric['Units'] = OnlineGeneric['Units'],
  _FeeUnits extends OnlineGeneric['FeeUnits'] = OnlineGeneric['FeeUnits'],
  _TransactionCursor extends OnlineGeneric['TransactionCursor'] = OnlineGeneric['TransactionCursor'],
  _BalanceConfiguration extends Object | undefined = undefined
> {
  getTransactionsForAddress(
    address: Address,
    limit: number,
    cursor?: _TransactionCursor
  ): Promise<AirGapTransactionsWithCursor<_TransactionCursor, _Units, _FeeUnits>>

  getBalanceOfAddress(address: Address, configuration?: _BalanceConfiguration): Promise<Balance<_Units>>
}
