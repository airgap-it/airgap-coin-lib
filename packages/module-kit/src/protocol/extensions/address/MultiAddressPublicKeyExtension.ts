import { AddressWithCursor } from '../../../types/address'
import { ExtendedPublicKey, PublicKey } from '../../../types/key'
import { _AnyProtocol, _BaseProtocol, BaseGeneric } from '../../protocol'

export type MultiAddressPublicKeyExtension<T extends _AnyProtocol> = T extends _BaseProtocol<
  infer _BaseAddressCursor,
  infer _AddressResult,
  any,
  any,
  any,
  any,
  infer _PublicKey
>
  ? _AddressResult extends AddressWithCursor<infer _AddressCursor> // otherwise the type won't get inferred
    ? MultiAddressPublicKeyProtocol<_AddressCursor, _PublicKey>
    : MultiAddressPublicKeyProtocol<_BaseAddressCursor, _PublicKey>
  : never

export interface MultiAddressPublicKeyProtocol<
  _AddressCursor extends BaseGeneric['AddressCursor'] = BaseGeneric['AddressCursor'],
  _PublicKey extends PublicKey | ExtendedPublicKey = PublicKey
> {
  getInitialAddressesFromPublicKey(publicKey: _PublicKey): Promise<AddressWithCursor<_AddressCursor>[]>
  getNextAddressFromPublicKey(publicKey: _PublicKey, cursor: _AddressCursor): Promise<AddressWithCursor<_AddressCursor> | undefined>
}
