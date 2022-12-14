// https://tezos.gitlab.io/whitedoc/michelson.html#full-grammar

import { MichelsonGrammarInstruction } from './MichelsonGrammarInstruction'

export type MichelsonGrammarData =
  | 'Unit'
  | 'True'
  | 'False'
  | 'Pair'
  | 'Left'
  | 'Right'
  | 'Some'
  | 'None'
  | 'Elt'
  | MichelsonGrammarInstruction
