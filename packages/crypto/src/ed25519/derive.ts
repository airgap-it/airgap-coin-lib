import { generateKeyPairFromSeed } from '@airgap/coinlib-core/dependencies/src/@stablelib/ed25519-1.0.3/packages/ed25519/ed25519'
import { SHA512 } from '@airgap/coinlib-core/dependencies/src/@stablelib/sha512-1.0.1/packages/sha512/sha512'
import { hmac } from '@stablelib/hmac'

import { DerivationIndex, DerivationNode } from '../types/derivation'
import { splitDerivationPath } from '../utils/derivation'
import { hash160 } from '../utils/hash'

const ED25519_KEY: string = 'ed25519 seed'

export function deriveEd25519(seed: Buffer, derivationPath?: string, key: string = ED25519_KEY): DerivationNode {
  const masterNode: DerivationNode = masterNodeFromSeed(seed, key)

  return derivationPath !== undefined ? derive(masterNode, derivationPath) : masterNode
}

function masterNodeFromSeed(seed: Buffer, key: string): DerivationNode {
  const { key: secretKey, chainCode } = getKey(seed, Buffer.from(key, 'utf-8'))

  return {
    depth: 0,
    parentFingerprint: 0x00000000,
    index: 0,
    chainCode,
    secretKey,
    publicKey: getPublicKey(secretKey)
  }
}

function derive(masterNode: DerivationNode, derivationPath: string): DerivationNode {
  const derivationIndices: DerivationIndex[] = splitDerivationPath(derivationPath)

  return derivationIndices.reduce((derivedNode: DerivationNode, next: DerivationIndex) => {
    const parentFingerprint: number = hash160(derivedNode.publicKey).readUInt32BE()

    const index: number = next.masked
    const indexBuffer: Buffer = Buffer.alloc(4)
    indexBuffer.writeUInt32BE(index)

    const data: Buffer = Buffer.concat([Buffer.alloc(1, 0), derivedNode.secretKey, indexBuffer])

    const { key: secretKey, chainCode } = getKey(data, derivedNode.chainCode)

    return {
      depth: derivedNode.depth + 1,
      parentFingerprint,
      index,
      chainCode,
      secretKey,
      publicKey: getPublicKey(secretKey)
    }
  }, masterNode)
}

function getKey(data: Buffer, key: Buffer): { key: Buffer; chainCode: Buffer } {
  const I: Buffer = Buffer.from(hmac(SHA512, key, data))
  const IL: Buffer = I.slice(0, 32)
  const IR: Buffer = I.slice(32)

  return { key: IL, chainCode: IR }
}

function getPublicKey(privateKey: Buffer): Buffer {
  const { publicKey } = generateKeyPairFromSeed(privateKey)

  return Buffer.from(publicKey)
}
