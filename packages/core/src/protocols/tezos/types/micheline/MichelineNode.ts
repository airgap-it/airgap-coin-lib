// https://tezos.gitlab.io/whitedoc/micheline.html#bnf-grammar
// https://tezos.gitlab.io/whitedoc/micheline.html#conversion-to-json

import { MichelsonGrammarData } from '../michelson/grammar/MichelsonGrammarData'
import { MichelsonGrammarInstruction } from '../michelson/grammar/MichelsonGrammarInstruction'
import { MichelsonGrammarType } from '../michelson/grammar/MichelsonGrammarType'

export type MichelineGenericNode<T extends MichelsonGrammarType | MichelsonGrammarData> =
  | MichelinePrimitive<'int'>
  | MichelinePrimitive<'string'>
  | MichelinePrimitive<'bytes'>
  | MichelinePrimitiveApplication<T>
  | MichelineGenericNode<T>[]

export type MichelineNode = MichelineGenericNode<MichelsonGrammarType | MichelsonGrammarData>
export type MichelineTypeNode = MichelineGenericNode<MichelsonGrammarType>
export type MichelineDataNode = MichelineGenericNode<MichelsonGrammarData>
export type MichelineCodeNode = MichelineGenericNode<MichelsonGrammarInstruction>

export type MichelinePrimitiveType = 'int' | 'string' | 'bytes'
export type MichelinePrimitive<T extends MichelinePrimitiveType> = Record<T, string>

export interface MichelinePrimitiveApplication<T extends MichelsonGrammarType | MichelsonGrammarData> {
  prim: T
  args?: MichelineGenericNode<T>[]
  annots?: string[]
}
