import { UnsignedTransaction } from './unsigned-transaction'

interface TezosSaplingInput {
  rcm: string
  pos: string
  value: string
  address: string
}

interface TezosSaplingOutput {
  address: string
  value: string
  memo: string
}

interface TezosSaplingStateDiff {
  root: string
  commitments_and_ciphertexts: [string, TezosSaplingCiphertext][]
  nullifiers: string[]
}

interface TezosSaplingCiphertext {
  cv: string
  epk: string
  payload_enc: string
  nonce_enc: string
  payload_out: string
  nonce_out: string
}

interface RawTezosSaplingTransaction {
  ins: TezosSaplingInput[]
  outs: TezosSaplingOutput[]
  chainId: string
  stateDiff: TezosSaplingStateDiff
  callParameters: string
}

export interface UnsignedTezosSaplingTransaction extends UnsignedTransaction {
  transaction: RawTezosSaplingTransaction
}