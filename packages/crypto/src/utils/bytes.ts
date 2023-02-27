import { DerivationKey, DerivationKeyType, DerivationNode } from '../types/derivation'

import { newDerivationNodeFromKeys } from './factory'

export interface BytesNode {
  type: 'bytes'
  secretKey: Buffer
  publicKey: Buffer
}

export function bytesEncodeNode(node: DerivationNode): BytesNode {
  return {
    type: 'bytes',
    secretKey: encodeKey(node, 'secretKey'),
    publicKey: encodeKey(node, 'publicKey')
  }
}

function encodeKey(node: DerivationNode, keyType: DerivationKeyType): Buffer {
  const depth: Buffer = Buffer.alloc(1)
  depth.writeUInt8(node.depth)

  const parentFingerprint: Buffer = Buffer.alloc(4)
  parentFingerprint.writeUInt32BE(node.parentFingerprint)

  const index: Buffer = Buffer.alloc(4)
  index.writeUInt32BE(node.index)

  const chainCode: Buffer = node.chainCode
  const key: Buffer = node[keyType]

  return Buffer.concat([depth, parentFingerprint, index, chainCode, key])
}

export function bytesDecodeNode(node: BytesNode): DerivationNode {
  const xprvDecoded: DerivationKey = decodeKey(node.secretKey)
  const xpubDecoded: DerivationKey = decodeKey(node.publicKey)

  return newDerivationNodeFromKeys(xprvDecoded, xpubDecoded)
}

function decodeKey(buffer: Buffer): DerivationKey {
  const depth: number = buffer.readUInt8(0)
  const parentFingerprint: number = buffer.readUInt32BE(1)
  const index: number = buffer.readUInt32BE(5)
  const chainCode: Buffer = buffer.slice(9, 41)
  const key: Buffer = buffer.slice(41)

  return {
    depth,
    parentFingerprint,
    index,
    chainCode,
    key
  }
}
