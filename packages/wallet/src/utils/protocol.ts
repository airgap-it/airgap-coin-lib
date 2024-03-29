import { AddressWithCursor, ExtendedPublicKey, OfflineBip32Protocol, OnlineBip32Protocol } from '@airgap/module-kit'

import { normalizeAddress } from './address'

export async function deriveAddresses(
  protocol: OfflineBip32Protocol | OnlineBip32Protocol,
  publicKey: ExtendedPublicKey,
  visibilityIndex: number,
  amount: number,
  offset: number
): Promise<AddressWithCursor[]> {
  const generatorArray = Array.from(new Array(amount), (_, i) => i + offset)

  return Promise.all(
    generatorArray.map(async (x) => {
      const derivedKey = await protocol.deriveFromExtendedPublicKey(publicKey, visibilityIndex, x)

      return normalizeAddress(await protocol.getAddressFromPublicKey(derivedKey))
    })
  )
}
