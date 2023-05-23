import { Sr25519CryptoConfiguration } from '@airgap/module-kit'
import { sr25519DeriveKeypairHard, sr25519DeriveKeypairSoft, sr25519KeypairFromSeed, waitReady } from '@polkadot/wasm-crypto'

import { DerivationIndex, DerivationNode } from '../types/derivation'
import { splitDerivationPath } from '../utils/derivation'
import { hash160 } from '../utils/hash'

export async function deriveSr25519(
  compatibility: Sr25519CryptoConfiguration['compatibility'],
  seed: Buffer,
  derivationPath?: string
): Promise<DerivationNode> {
  return compatibility === 'substrate' ? deriveSr25519Substrate(seed, derivationPath) : deriveSr25519Standard(seed, derivationPath)
}

async function deriveSr25519Standard(seed: Buffer, derivationPath?: string): Promise<DerivationNode> {
  throw new Error('Not implemented')
}

async function deriveSr25519Substrate(seed: Buffer, derivationPath?: string): Promise<DerivationNode> {
  const masterNode: DerivationNode = await substrateMasterKeyFromSeed(seed)

  return derivationPath !== undefined ? deriveSubstrate(masterNode, derivationPath) : masterNode
}

async function substrateMasterKeyFromSeed(seed: Buffer): Promise<DerivationNode> {
  await waitReady()

  const keyPair: Uint8Array = sr25519KeypairFromSeed(seed.slice(0, 32))
  const { secretKey, publicKey } = splitKeyPair(keyPair)

  return {
    depth: 0,
    parentFingerprint: 0x00000000,
    index: 0,
    chainCode: Buffer.alloc(32, 0),
    secretKey,
    publicKey
  }
}

async function deriveSubstrate(masterNode: DerivationNode, derivationPath: string): Promise<DerivationNode> {
  await waitReady()

  const derivationIndices: DerivationIndex[] = splitDerivationPath(derivationPath)

  return derivationIndices.reduce((derivedKey: DerivationNode, next: DerivationIndex) => {
    const parentFingerprint: number = hash160(derivedKey.publicKey).readUInt32BE(0)

    const deriveKeyPair = next.isHardened ? sr25519DeriveKeypairHard : sr25519DeriveKeypairSoft
    const keyPair = Buffer.concat([derivedKey.secretKey, derivedKey.publicKey])
    const index = Buffer.alloc(32, 0)
    index.writeUInt32LE(next.value)

    const derivedKeyPair = deriveKeyPair(keyPair, index)

    const { secretKey, publicKey } = splitKeyPair(derivedKeyPair)

    return {
      depth: derivedKey.depth + 1,
      parentFingerprint,
      index: next.masked,
      chainCode: index,
      secretKey,
      publicKey
    }
  }, masterNode)
}

function splitKeyPair(keyPair: Uint8Array): { secretKey: Buffer; publicKey: Buffer } {
  const keyPairBuffer: Buffer = Buffer.from(keyPair)

  const secretKey: Buffer = keyPairBuffer.slice(0, 64)
  const publicKey: Buffer = keyPairBuffer.slice(64)

  return { secretKey, publicKey }
}
