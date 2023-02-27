import { assertNever } from '@airgap/coinlib-core'
import { CryptoDerivative } from '@airgap/module-kit'

import { DerivationNode } from './types/derivation'
import { bip32DecodeNode, bip32EncodeNode, Bip32Node, Version } from './utils/bip32'
import { bytesDecodeNode, bytesEncodeNode, BytesNode } from './utils/bytes'
import { newCryptoDerivativeFromNode, newDerivationNodeFromDerivative } from './utils/factory'
import { hexDecodeNode, hexEncodeNode, HexNode } from './utils/hex'
import { zip32DecodeNode, zip32EncodeNode, Zip32Node } from './utils/zip32'

type EncodingType = BytesNode['type'] | HexNode['type'] | Bip32Node['type'] | Zip32Node['type']
type EncodedNode = BytesNode | HexNode | Bip32Node | Zip32Node

export function encodeDerivative(type: BytesNode['type'], derivative: CryptoDerivative): BytesNode
export function encodeDerivative(type: HexNode['type'], derivative: CryptoDerivative): HexNode
export function encodeDerivative(type: Bip32Node['type'], derivative: CryptoDerivative, version?: Version): Bip32Node
export function encodeDerivative(type: Zip32Node['type'], derivative: CryptoDerivative): Zip32Node
export function encodeDerivative(type: EncodingType, derivative: CryptoDerivative, bip39VersionOrUndefined?: Version): EncodedNode {
  const node: DerivationNode = newDerivationNodeFromDerivative(derivative)

  return encodeNode(type, node, bip39VersionOrUndefined)
}

function encodeNode(type: EncodingType, node: DerivationNode, bip39VersionOrUndefined?: Version): EncodedNode {
  switch (type) {
    case 'bytes':
      return bytesEncodeNode(node)
    case 'hex':
      return hexEncodeNode(node)
    case 'bip32':
      return bip32EncodeNode(node, bip39VersionOrUndefined)
    case 'zip32':
      return zip32EncodeNode(node)
    default:
      assertNever(type)
      throw new Error('Unsupported encoding type')
  }
}

export function decodeDerivative(node: EncodedNode): CryptoDerivative {
  const decodedNode: DerivationNode = decodeNode(node)

  return newCryptoDerivativeFromNode(decodedNode)
}

function decodeNode(node: EncodedNode): DerivationNode {
  switch (node.type) {
    case 'bytes':
      return bytesDecodeNode(node)
    case 'hex':
      return hexDecodeNode(node)
    case 'bip32':
      return bip32DecodeNode(node)
    case 'zip32':
      return zip32DecodeNode(node)
    default:
      assertNever(node)
      throw new Error('Unsupported encoded node type')
  }
}
