// https://tezos.gitlab.io/whitedoc/micheline.html#bnf-grammar
// https://tezos.gitlab.io/whitedoc/micheline.html#conversion-to-json

import { MichelsonType } from '../michelson/MichelsonType'
import { MichelsonData } from '../michelson/MichelsonData'

export type MichelineNode<T> =
  MichelinePrimitive<'int'> |
  MichelinePrimitive<'string'> |
  MichelinePrimitive<'bytes'> |
  MichelinePrimitiveApplication<T> | 
  MichelineNode<T>[]

export type MichelineTypeNode = MichelineNode<MichelsonType>
export type MichelineDataNode = MichelineNode<MichelsonData>

export type MichelinePrimitive<T extends 'int' | 'string' | 'bytes'> = Record<T, string>

export interface MichelinePrimitiveApplication<T> {
  prim: T
  args?: MichelineNode<T>[]
  annots?: string[]
}
