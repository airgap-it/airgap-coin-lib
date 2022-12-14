import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { TezosOperation } from './operations/kinds/TezosOperation'

export interface BakerInfo {
  balance: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  selfBond: BigNumber
  bakerCapacity: BigNumber
  bakerUsage: BigNumber
}

export interface DelegationRewardInfo {
  cycle: number
  reward: BigNumber
  deposit: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  totalRewards: BigNumber
  totalFees: BigNumber
  payout: Date
}

export interface DelegationInfo {
  isDelegated: boolean
  value?: string
  delegatedOpLevel?: number
  delegatedDate?: Date
}

export interface TezosPayoutInfo {
  delegator: string
  share: string
  payout: string
  balance: string
}

// run_operation response
export interface RunOperationBalanceUpdate {
  kind: string
  contract: string
  change: string
  category: string
  delegate: string
  cycle?: number
}

export interface RunOperationOperationBalanceUpdate {
  kind: string
  contract: string
  change: string
}

export interface RunOperationOperationResult {
  status: string
  errors?: unknown
  balance_updates: RunOperationOperationBalanceUpdate[]
  consumed_milligas: string
  paid_storage_size_diff?: string
  originated_contracts?: string[]
  allocated_destination_contract?: boolean
}

export interface RunOperationInternalOperationResult {
  result?: {
    errors?: unknown
    consumed_milligas: string
    paid_storage_size_diff?: string
    originated_contracts?: string[]
    allocated_destination_contract?: boolean
  }
  parameters?: {
    entrypoint: string
    value: unknown
  }
}

export interface RunOperationMetadata {
  balance_updates: RunOperationBalanceUpdate[]
  operation_result: RunOperationOperationResult
  internal_operation_results?: RunOperationInternalOperationResult[]
}

export interface RunOperationResponse {
  contents: (TezosOperation & {
    metadata: RunOperationMetadata
  })[]
  signature: string
}
