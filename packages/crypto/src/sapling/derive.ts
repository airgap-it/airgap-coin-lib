import { getExtendedFullViewingKeyFromSpendingKey, getExtendedSpendingKey } from '@airgap/sapling-wasm'

import { DerivationNode } from '../types/derivation'
import { zip32DecodeNode } from '../utils/zip32'

export async function deriveSapling(seed: Buffer, derivationPath?: string): Promise<DerivationNode> {
  const xsk: Buffer = await getExtendedSpendingKey(seed, derivationPath ?? 'm/')
  const xfvk: Buffer = await getExtendedFullViewingKeyFromSpendingKey(xsk)

  return zip32DecodeNode({
    type: 'zip32bytes',
    secretKey: xsk,
    publicKey: xfvk
  })
}
