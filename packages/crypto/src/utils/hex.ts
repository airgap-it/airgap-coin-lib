import { DerivationNode } from '../types/derivation'

import { bytesDecodeNode, bytesEncodeNode } from './bytes'

export interface HexNode {
  type: 'hex'
  secretKey: string
  publicKey: string
}

export function hexEncodeNode(node: DerivationNode): HexNode {
  const bytesNode = bytesEncodeNode(node)

  return {
    type: 'hex',
    secretKey: bytesNode.secretKey.toString('hex'),
    publicKey: bytesNode.publicKey.toString('hex')
  }
}

export function hexDecodeNode(node: HexNode): DerivationNode {
  return bytesDecodeNode({
    type: 'bytes',
    secretKey: Buffer.from(node.secretKey, 'hex'),
    publicKey: Buffer.from(node.publicKey, 'hex')
  })
}
