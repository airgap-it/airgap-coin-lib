import { AddressWithCursor } from '../../../module-kit/dist'

export function normalizeAddress(address: string | AddressWithCursor): AddressWithCursor {
  return typeof address === 'string'
    ? {
        address,
        cursor: { hasNext: false }
      }
    : address
}
