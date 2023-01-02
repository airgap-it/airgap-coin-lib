import { Address } from '../../../types/address'
import { Balance } from '../../../types/balance'
import { AirGapTransactionsWithCursor } from '../../../types/transaction'
import { _OnlineProtocol, OnlineGeneric } from '../../protocol'

export type FetchDataForMultipleAddressesExtension<T extends _OnlineProtocol> = T extends _OnlineProtocol<
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
  ? FetchDataForMultipleAddressesProtocol<_Units, _FeeUnits, _TransactionCursor, _BalanceConfiguration>
  : never

export interface FetchDataForMultipleAddressesProtocol<
  _Units extends OnlineGeneric['Units'] = OnlineGeneric['Units'],
  _FeeUnits extends OnlineGeneric['FeeUnits'] = OnlineGeneric['FeeUnits'],
  _TransactionCursor extends OnlineGeneric['TransactionCursor'] = OnlineGeneric['TransactionCursor'],
  _BalanceConfiguration extends Object | undefined = undefined
> {
  getTransactionsForAddresses(
    addresses: Address[],
    limit: number,
    cursor?: _TransactionCursor
  ): Promise<AirGapTransactionsWithCursor<_TransactionCursor, _Units, _FeeUnits>>

  getBalanceOfAddresses(addresses: Address[], configuration?: _BalanceConfiguration): Promise<Balance<_Units>>
}
