import { TezosOperationType } from '../TezosOperationType'
import { TezosOperation } from './TezosOperation'

export type MichelsonPrimitives =
  | 'ADD'
  | 'IF_NONE'
  | 'SWAP'
  | 'set'
  | 'nat'
  | 'CHECK_SIGNATURE'
  | 'IF_LEFT'
  | 'LAMBDA'
  | 'Elt'
  | 'CREATE_CONTRACT'
  | 'NEG'
  | 'big_map'
  | 'map'
  | 'or'
  | 'BLAKE2B'
  | 'bytes'
  | 'SHA256'
  | 'SET_DELEGATE'
  | 'CONTRACT'
  | 'LSL'
  | 'SUB'
  | 'IMPLICIT_ACCOUNT'
  | 'PACK'
  | 'list'
  | 'PAIR'
  | 'Right'
  | 'contract'
  | 'GT'
  | 'LEFT'
  | 'STEPS_TO_QUOTA'
  | 'storage'
  | 'TRANSFER_TOKENS'
  | 'CDR'
  | 'SLICE'
  | 'PUSH'
  | 'False'
  | 'SHA512'
  | 'CHAIN_ID'
  | 'BALANCE'
  | 'signature'
  | 'DUG'
  | 'SELF'
  | 'EMPTY_BIG_MAP'
  | 'LSR'
  | 'OR'
  | 'XOR'
  | 'lambda'
  | 'COMPARE'
  | 'key'
  | 'option'
  | 'Unit'
  | 'Some'
  | 'UNPACK'
  | 'NEQ'
  | 'INT'
  | 'pair'
  | 'AMOUNT'
  | 'DIP'
  | 'ABS'
  | 'ISNAT'
  | 'EXEC'
  | 'NOW'
  | 'LOOP'
  | 'chain_id'
  | 'string'
  | 'MEM'
  | 'MAP'
  | 'None'
  | 'address'
  | 'CONCAT'
  | 'EMPTY_SET'
  | 'MUL'
  | 'LOOP_LEFT'
  | 'timestamp'
  | 'LT'
  | 'UPDATE'
  | 'DUP'
  | 'SOURCE'
  | 'mutez'
  | 'SENDER'
  | 'IF_CONS'
  | 'RIGHT'
  | 'CAR'
  | 'CONS'
  | 'LE'
  | 'NONE'
  | 'IF'
  | 'SOME'
  | 'GET'
  | 'Left'
  | 'CAST'
  | 'int'
  | 'SIZE'
  | 'key_hash'
  | 'unit'
  | 'DROP'
  | 'EMPTY_MAP'
  | 'NIL'
  | 'DIG'
  | 'APPLY'
  | 'bool'
  | 'RENAME'
  | 'operation'
  | 'True'
  | 'FAILWITH'
  | 'parameter'
  | 'HASH_KEY'
  | 'EQ'
  | 'NOT'
  | 'UNIT'
  | 'Pair'
  | 'ADDRESS'
  | 'EDIV'
  | 'CREATE_ACCOUNT'
  | 'GE'
  | 'ITER'
  | 'code'
  | 'AND'

export type MichelineMichelsonV1Expression =
  | { int: string }
  | { string: string }
  | { bytes: string }
  | MichelineMichelsonV1Expression[]
  | {
      prim: MichelsonPrimitives
      args?: MichelineMichelsonV1Expression[]
      annots?: string[]
    }

export interface Parameters {
  entrypoint: 'default' | 'root' | 'do' | 'set_delegate' | 'remove_delegate' | string
  value: MichelineMichelsonV1Expression
}

export interface TezosTransactionOperation extends TezosOperation {
  kind: TezosOperationType.TRANSACTION
  source: string
  fee: string
  counter: string
  gas_limit: string
  storage_limit: string
  amount: string
  destination: string
  parameters?: Parameters
}
