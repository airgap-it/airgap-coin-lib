import { MichelineNode, MichelinePrimitive, MichelinePrimitiveApplication } from './micheline/MichelineNode'

export function isMichelineNode(node: unknown): node is MichelineNode {
  return isMichelineNodeRecursive(node, 0)
}

function isMichelineNodeRecursive(node: unknown, recursionLevel: number): node is MichelineNode {
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

const MICHELINE_MAX_CHECK_RECURSION_DEPTH: number = 1
export function isMichelineSequence(node: unknown, recursive: boolean = true): node is MichelineNode[] {
  return isMichelineSequenceRecursive(node, recursive ? 0 : MICHELINE_MAX_CHECK_RECURSION_DEPTH + 1)
}

function isMichelineSequenceRecursive(node: unknown, recursionLevel: number): node is MichelineNode[] {
  return (
    Array.isArray(node) && 
    (
      node.length === 0 ||

      // for simplicity and to avoid too many recursive calls for complex structures
      // after the `MAX_CHECK_RECURSION_DEPTH`th level has been reached, we assume every array is a valid Micheline sequence
      recursionLevel > MICHELINE_MAX_CHECK_RECURSION_DEPTH ||
      node.every((element: unknown) => isMichelineNodeRecursive(element, recursionLevel + 1))
    )
  )
}