import { BaseCursor } from './base/cursor'

export type Address = string

export interface AddressCursor extends BaseCursor {}

export interface AddressWithCursor<_Cursor extends AddressCursor = AddressCursor> {
  address: Address
  cursor: _Cursor
}
