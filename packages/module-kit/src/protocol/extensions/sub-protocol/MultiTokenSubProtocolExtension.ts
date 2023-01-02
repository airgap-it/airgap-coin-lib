import { ExtendedPublicKey, PublicKey } from '../../../types/key'
import { Override } from '../../../types/meta/utility-types'
import { _AnyProtocol, _OnlineProtocol, OnlineGeneric } from '../../protocol'

import { SingleTokenSubProtocol } from './SingleTokenSubProtocolExtension'

export type MultiTokenSubProtocolExtension<T extends _AnyProtocol> = T extends _OnlineProtocol<
  infer _AddressCursor,
  infer _AddressResult,
  infer _ProtocolNetwork,
  infer _Units,
  infer _FeeUnits,
  infer _FeeEstimation,
  infer _SignedTransaction,
  infer _UnsignedTransaction,
  infer _TransactionCursor,
  infer _PublicKey,
  infer _BalanceConfiguration
>
  ? OnlineMultiTokenSubProtocol<
      _AddressCursor,
      _AddressResult,
      _ProtocolNetwork,
      _Units,
      _FeeUnits,
      _FeeEstimation,
      _SignedTransaction,
      _UnsignedTransaction,
      _TransactionCursor,
      _PublicKey,
      _BalanceConfiguration
    >
  : BaseMultiTokenSubProtocol

export interface BaseMultiTokenSubProtocol extends SingleTokenSubProtocol {}

export interface MultiTokenBalanceConfiguration {
  tokenId: string
}

export interface OnlineMultiTokenSubProtocol<
  _AddressCursor extends OnlineGeneric['AddressCursor'] = OnlineGeneric['AddressCursor'],
  _AddressResult extends OnlineGeneric['AddressResult'] = OnlineGeneric['AddressResult'],
  _ProtocolNetwork extends OnlineGeneric['ProtocolNetwork'] = OnlineGeneric['ProtocolNetwork'],
  _Units extends OnlineGeneric['Units'] = OnlineGeneric['Units'],
  _FeeUnits extends OnlineGeneric['FeeUnits'] = OnlineGeneric['FeeUnits'],
  _FeeEstimation extends OnlineGeneric['FeeEstimation'] = OnlineGeneric['FeeEstimation'],
  _SignedTransaction extends OnlineGeneric['SignedTransaction'] = OnlineGeneric['SignedTransaction'],
  _UnsignedTransaction extends OnlineGeneric['UnsignedTransaction'] = OnlineGeneric['UnsignedTransaction'],
  _TransactionCursor extends OnlineGeneric['TransactionCursor'] = OnlineGeneric['TransactionCursor'],
  _PublicKey extends PublicKey | ExtendedPublicKey = PublicKey,
  _BalanceConfiguration extends unknown | undefined = undefined
> extends BaseMultiTokenSubProtocol,
    _OnlineProtocol<
      _AddressCursor,
      _AddressResult,
      _ProtocolNetwork,
      _Units,
      _FeeUnits,
      _FeeEstimation,
      _SignedTransaction,
      _UnsignedTransaction,
      _TransactionCursor,
      _PublicKey,
      MultiTokenBalanceConfiguration extends _BalanceConfiguration
        ? MultiTokenBalanceConfiguration
        : _BalanceConfiguration extends undefined
        ? MultiTokenBalanceConfiguration
        : Override<_BalanceConfiguration, MultiTokenBalanceConfiguration>
    > {}
