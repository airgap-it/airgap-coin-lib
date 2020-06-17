// https://tezos.gitlab.io/whitedoc/micheline.html#bnf-grammar
// https://tezos.gitlab.io/whitedoc/micheline.html#conversion-to-json

import { MichelsonType } from '../michelson/types'
import { ITezosContractCode } from '../TezosContractCode'

export interface MichelineContractNode {
  prim: keyof ITezosContractCode
  args: MichelineNode[]
}
export type MichelineContract = MichelineContractNode[]

export type MichelineNode = 
  MichelinePrimitive<'int'> |
  MichelinePrimitive<'string'> |
  MichelinePrimitive<'bytes'> |
  MichelinePrimitiveApplication | 
  MichelineNode[]

export type MichelinePrimitive<T extends 'int' | 'string' | 'bytes'> = Record<T, string>

export interface MichelinePrimitiveApplication {
  prim: MichelsonType
  args?: MichelineNode[]
  annots?: string[]
}
