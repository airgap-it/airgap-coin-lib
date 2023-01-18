import { TezosSaplingInput } from '../protocol/types/sapling/TezosSaplingInput'
import { TezosSaplingOutput } from '../protocol/types/sapling/TezosSaplingOutput'
import { TezosSaplingStateDiff } from '../protocol/types/sapling/TezosSaplingStateDiff'

export interface RawTezosTransaction {
  binaryTransaction: string
}

export interface RawTezosSaplingTransaction {
  ins: TezosSaplingInput[]
  outs: TezosSaplingOutput[]
  contractAddress: string
  chainId: string
  stateDiff: TezosSaplingStateDiff
  unshieldTarget: string
}
