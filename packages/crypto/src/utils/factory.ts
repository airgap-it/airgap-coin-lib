import { CryptoDerivative } from '@airgap/module-kit'

import { DerivationKey, DerivationNode } from '../types/derivation'

export function newDerivationNodeFromDerivative(derivative: CryptoDerivative): DerivationNode {
  return {
    depth: derivative.depth,
    parentFingerprint: derivative.parentFingerprint,
    index: derivative.index,
    chainCode: Buffer.from(derivative.chainCode, 'hex'),
    secretKey: Buffer.from(derivative.secretKey, 'hex'),
    publicKey: Buffer.from(derivative.publicKey, 'hex')
  }
}

export function newDerivationNodeFromKeys(secretKey: DerivationKey, publicKey: DerivationKey): DerivationNode {
  if (
    secretKey.depth !== publicKey.depth ||
    secretKey.parentFingerprint !== publicKey.parentFingerprint ||
    secretKey.index !== publicKey.index ||
    !secretKey.chainCode.equals(publicKey.chainCode)
  ) {
    throw new Error('Derivation keys mismatch')
  }

  return {
    depth: secretKey.depth,
    parentFingerprint: secretKey.parentFingerprint,
    index: secretKey.index,
    chainCode: secretKey.chainCode,
    secretKey: secretKey.key,
    publicKey: publicKey.key
  }
}

export function newCryptoDerivativeFromKeys(secretKey: DerivationKey, publicKey: DerivationKey): CryptoDerivative {
  const node: DerivationNode = newDerivationNodeFromKeys(secretKey, publicKey)

  return newCryptoDerivativeFromNode(node)
}

export function newCryptoDerivativeFromNode(node: DerivationNode): CryptoDerivative {
  return {
    depth: node.depth,
    parentFingerprint: node.parentFingerprint,
    index: node.index,
    chainCode: node.chainCode.toString('hex'),
    secretKey: node.secretKey.toString('hex'),
    publicKey: node.publicKey.toString('hex')
  }
}
