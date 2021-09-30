import { CosmosTransaction } from '../protocols/cosmos/CosmosTransaction'
import { TezosSaplingInput } from '../protocols/tezos/types/sapling/TezosSaplingInput'
import { TezosSaplingOutput } from '../protocols/tezos/types/sapling/TezosSaplingOutput'
import { TezosSaplingStateDiff } from '../protocols/tezos/types/sapling/TezosSaplingStateDiff'

import { UnsignedTransaction } from './schemas/definitions/unsigned-transaction'

export interface RawTezosTransaction {
  binaryTransaction: string
}

export interface RawTezosSaplingTransaction {
  ins: TezosSaplingInput[]
  outs: TezosSaplingOutput[]
  chainId: string
  stateDiff: TezosSaplingStateDiff
  callParameters: string
}

export interface RawEthereumTransaction {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: number
  data: string
}

export interface IInTransaction {
  txId: string
  value: string
  vout: number
  address: string
  derivationPath?: string
}

export interface IOutTransaction {
  recipient: string
  isChange: boolean
  value: string
  derivationPath?: string
}

export interface RawBitcoinTransaction {
  ins: IInTransaction[]
  outs: IOutTransaction[]
}

export interface RawBitcoinSegwitTransaction {
  psbt: string
}

export interface RawAeternityTransaction {
  networkId: string
  transaction: string
}

export interface UnsignedCosmosTransaction extends UnsignedTransaction {
  transaction: CosmosTransaction
}

export interface RawSubstrateTransaction {
  encoded: string
}
