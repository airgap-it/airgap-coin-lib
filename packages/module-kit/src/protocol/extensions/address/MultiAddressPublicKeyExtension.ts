import { AddressWithCursor } from '../../../types/address'
import { ExtendedPublicKey, PublicKey } from '../../../types/key'
import { _BaseProtocol, AnyProtocol, BaseGeneric } from '../../protocol'
import { BaseBip32Protocol } from '../bip/Bip32OverridingExtension'

export type MultiAddressPublicKeyExtension<T extends AnyProtocol> = T extends BaseBip32Protocol<
  infer _AddressCursor,
  infer _AddressResult,
  any,
  any,
  any
>
  ? _AddressResult extends AddressWithCursor<_AddressCursor> // otherwise the type won't get inferred
    ? MultiAddressExtendedPublicKeyProtocol<_AddressCursor>
    : MultiAddressExtendedPublicKeyProtocol<_AddressCursor>
  : T extends _BaseProtocol<infer _AddressCursor, infer _AddressResult, any, any, any, any>
  ? _AddressResult extends AddressWithCursor<_AddressCursor> // otherwise the type won't get inferred
    ? MultiAddressNonExtendedPublicKeyProtocol<_AddressCursor>
    : MultiAddressNonExtendedPublicKeyProtocol<_AddressCursor>
  : never

export interface MultiAddressNonExtendedPublicKeyProtocol<
  _AddressCursor extends BaseGeneric['AddressCursor'] = BaseGeneric['AddressCursor']
> {
  getNextAddressFromPublicKey(publicKey: PublicKey, cursor: _AddressCursor): Promise<AddressWithCursor<_AddressCursor> | undefined>
}

export interface MultiAddressExtendedPublicKeyProtocol<_AddressCursor extends BaseGeneric['AddressCursor'] = BaseGeneric['AddressCursor']> {
  getNextAddressFromPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    cursor: _AddressCursor
  ): Promise<AddressWithCursor<_AddressCursor> | undefined>
}
