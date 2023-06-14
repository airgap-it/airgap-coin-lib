import { SHA512 } from '@airgap/coinlib-core/dependencies/src/@stablelib/sha512-1.0.1/packages/sha512/sha512'
// @ts-ignore
import secp256k1 from '@airgap/coinlib-core/dependencies/src/secp256k1-4.0.2/elliptic'
import { hmac } from '@stablelib/hmac'

import { DerivationIndex, DerivationNode } from '../types/derivation'
import { incIndex, splitDerivationPath } from '../utils/derivation'
import { hash160 } from '../utils/hash'

const BITCOIN_KEY: string = 'Bitcoin seed'

export function deriveSecp256K1(seed: Buffer, derivationPath?: string, key: string = BITCOIN_KEY): DerivationNode {
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

  return derivationIndices.reduce(deriveChild, masterNode)
}

function deriveChild(node: DerivationNode, derivationIndex: DerivationIndex): DerivationNode {
  const parentFingerprint: number = hash160(node.publicKey).readUInt32BE(0)

  const index: number = derivationIndex.masked
  const indexBuffer: Buffer = Buffer.alloc(4)
  indexBuffer.writeUInt32BE(index)

  const data: Buffer = derivationIndex.isHardened
    ? Buffer.concat([Buffer.alloc(1, 0), node.secretKey, indexBuffer])
    : Buffer.concat([node.publicKey, indexBuffer])

  const { key, chainCode } = getKey(data, node.chainCode)

  try {
    const ki = Buffer.from(secp256k1.privateKeyTweakAdd(Buffer.from(node.secretKey), key))

    return {
      depth: node.depth + 1,
      parentFingerprint,
      index,
      chainCode,
      secretKey: ki,
      publicKey: getPublicKey(ki)
    }
  } catch {
    return deriveChild(node, incIndex(derivationIndex))
  }
}

function getKey(data: Buffer, key: Buffer): { key: Buffer; chainCode: Buffer } {
  const I: Buffer = Buffer.from(hmac(SHA512, key, data))
  const IL: Buffer = I.slice(0, 32)
  const IR: Buffer = I.slice(32)

  return { key: IL, chainCode: IR }
}

function getPublicKey(privateKey: Buffer): Buffer {
  const publicKey = secp256k1.publicKeyCreate(privateKey, true)

  return Buffer.from(publicKey)
}
