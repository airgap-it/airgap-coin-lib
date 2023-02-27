// @ts-ignore
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'

import { DerivationKey, DerivationKeyType, DerivationNode } from '../types/derivation'

import { newDerivationNodeFromKeys } from './factory'

const XPRV_VERSION: string = '0488ade4'
const XPUB_VERSION: string = '0488b21e'

export interface Version {
  secretKey?: string
  publicKey?: string
}

export interface Bip32Node {
  type: 'bip32'
  secretKey: string
  publicKey: string
}

export function bip32EncodeNode(node: DerivationNode, version: Version = {}): Bip32Node {
  return {
    type: 'bip32',
    secretKey: encodeKey(node, version.secretKey ?? XPRV_VERSION, 'secretKey'),
    publicKey: encodeKey(node, version.publicKey ?? XPUB_VERSION, 'publicKey')
  }
}

function encodeKey(node: DerivationNode, version: string, keyType: DerivationKeyType): string {
  const versionBuffer: Buffer = Buffer.from(version, 'hex')

  const depth: Buffer = Buffer.alloc(1)
  depth.writeUInt8(node.depth)

  const parentFingerprint: Buffer = Buffer.alloc(4)
  parentFingerprint.writeUInt32BE(node.parentFingerprint)

  const index: Buffer = Buffer.alloc(4)
  index.writeUInt32BE(node.index)

  const chainCode: Buffer = node.chainCode
  const key: Buffer = keyType === 'secretKey' ? Buffer.concat([Buffer.alloc(1, 0), node[keyType]]) : node[keyType]

  return bs58check.encode(Buffer.concat([versionBuffer, depth, parentFingerprint, index, chainCode, key]))
}

export function bip32DecodeNode(node: Bip32Node, version: Version = {}): DerivationNode {
  const xprvDecoded: DerivationKey = decodeKey(node.secretKey, version.secretKey ?? XPRV_VERSION, 'secretKey')
  const xpubDecoded: DerivationKey = decodeKey(node.publicKey, version.publicKey ?? XPUB_VERSION, 'publicKey')

  return newDerivationNodeFromKeys(xprvDecoded, xpubDecoded)
}

function decodeKey(key: string, version: string, keyType: DerivationKeyType): DerivationKey {
  const buffer: Buffer = bs58check.decode(key)
  const versionBuffer: Buffer = buffer.slice(0, 4)
  if (versionBuffer.toString('hex') !== version) {
    throw new Error('Invalid Bip32 version')
  }

  const depth: number = buffer.readUInt8(4)
  const parentFingerprint: number = buffer.readUInt32BE(5)
  const index: number = buffer.readUInt32BE(9)
  const chainCode: Buffer = buffer.slice(13, 45)

  return {
    depth,
    parentFingerprint,
    index,
    chainCode,
    key: keyType === 'secretKey' ? buffer.slice(46) : buffer.slice(45)
  }
}
