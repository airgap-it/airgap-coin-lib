import { assertNever } from '@airgap/coinlib-core'
import { CryptoConfiguration, CryptoDerivative } from '@airgap/module-kit'

import { deriveEd25519 } from './ed25519/derive'
import { deriveSapling } from './sapling/derive'
import { deriveSecp256K1 } from './secp256k1/derive'
import { deriveSr25519 } from './sr25519/derive'
import { DerivationNode } from './types/derivation'
import { newCryptoDerivativeFromNode } from './utils/factory'

export async function derive(crypto: CryptoConfiguration, seed: Buffer, derivationPath?: string): Promise<CryptoDerivative> {
  const node: DerivationNode = await deriveNode(crypto, seed, derivationPath)

  return newCryptoDerivativeFromNode(node)
}

async function deriveNode(crypto: CryptoConfiguration, seed: Buffer, derivationPath?: string): Promise<DerivationNode> {
  switch (crypto.algorithm) {
    case 'ed25519':
      return deriveEd25519(seed, derivationPath, crypto.key)
    case 'sr25519':
      return deriveSr25519(crypto.compatibility, seed, derivationPath)
    case 'secp256k1':
      return deriveSecp256K1(seed, derivationPath, crypto.key)
    case 'sapling':
      return deriveSapling(seed, derivationPath)
    default:
      assertNever(crypto)
      throw new Error('Crypto algorithm not supported')
  }
}
