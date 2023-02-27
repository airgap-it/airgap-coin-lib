import { DerivationNode } from '../types/derivation'

import { bytesDecodeNode } from './bytes'
import { hexDecodeNode, hexEncodeNode } from './hex'

export interface Zip32Node {
  type: 'zip32'
  secretKey: string
  publicKey: string
}

export interface Zip32BytesNode {
  type: 'zip32bytes'
  secretKey: Buffer
  publicKey: Buffer
}

export function zip32EncodeNode(node: DerivationNode): Zip32Node {
  return {
    ...hexEncodeNode(node),
    type: 'zip32'
  }
}

export function zip32DecodeNode(node: Zip32Node | Zip32BytesNode): DerivationNode {
  return node.type === 'zip32' ? hexDecodeNode({ ...node, type: 'hex' }) : bytesDecodeNode({ ...node, type: 'bytes' })
}
