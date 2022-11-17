import { AddressWithCursor, AirGapAnyExtendedProtocol, ExtendedPublicKey } from '@airgap/module-kit'

export async function deriveAddresses(
  protocol: AirGapAnyExtendedProtocol,
  publicKey: ExtendedPublicKey,
  visibilityIndex: number,
  amount: number,
  offset: number
): Promise<AddressWithCursor[]> {
  const generatorArray = [amount].map((_, i) => i + offset)

  return Promise.all(
    generatorArray.map(async (x) => {
      const derivedKey = await protocol.deriveFromExtendedPublicKey(publicKey, visibilityIndex, x)

      return protocol.getAddressFromPublicKey(derivedKey)
    })
  )
}
