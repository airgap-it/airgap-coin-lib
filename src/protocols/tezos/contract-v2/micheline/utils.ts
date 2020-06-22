import { MichelineTypeNode, MichelinePrimitive, MichelinePrimitiveApplication } from './MichelineNode'

export function isMichelineNode(node: unknown): node is MichelineTypeNode {
  return isMichelineNodeRecursive(node, 0)
}

function isMichelineNodeRecursive(node: unknown, recursionLevel: number): node is MichelineTypeNode {
  return (
    isMichelinePrimitive('int', node) || 
    isMichelinePrimitive('string', node) || 
    isMichelinePrimitive('bytes', node) ||
    isMichelinePrimitiveApplication(node) || 
    isMichelineSequenceRecursive(node, recursionLevel)
  )
}

export function isMichelinePrimitive<T extends 'int' | 'string' | 'bytes'>(type: T, node: unknown): node is MichelinePrimitive<T> {
  return node instanceof Object && type in node
}

export function isMichelinePrimitiveApplication(node: unknown): node is MichelinePrimitiveApplication<any> {
  return node instanceof Object && 'prim' in node
}

const MAX_CHECK_RECURSION_DEPTH: number = 1
export function isMichelineSequence(node: unknown, recursive: boolean = true): node is MichelineTypeNode[] {
  return isMichelineSequenceRecursive(node, recursive ? 0 : MAX_CHECK_RECURSION_DEPTH + 1)
}

function isMichelineSequenceRecursive(node: unknown, recursionLevel: number): node is MichelineTypeNode[] {
  return (
    Array.isArray(node) && 
    (
      node.length === 0 ||

      // for simplicity and to avoid too many recursive calls for complex structures
      // after the `MAX_CHECK_RECURSION_DEPTH`th level has been reached, we assume every array is a valid Micheline sequence
      recursionLevel > MAX_CHECK_RECURSION_DEPTH ||
      node.every((element: unknown) => isMichelineNodeRecursive(element, recursionLevel + 1))
    )
  )
}