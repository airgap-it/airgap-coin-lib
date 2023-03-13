import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

enum CosmosMessageTypeIndex {
  SEND = 0,
  DELEGATE = 1,
  UNDELEGATE = 2,
  WITHDRAW_DELEGATION_REWARD = 3
}

export enum CosmosDelegationActionType {
  DELEGATE = 'delegate',
  UNDELEGATE = 'undelegate',
  WITHDRAW_ALL_REWARDS = 'withdraw_all_rewards',
  WITHDRAW_VALIDATOR_REWARDS = 'withdraw_validator_rewards'
}

interface CosmosCoin {
  denom: string
  amount: string
}

interface CosmosMessage {
  type: CosmosMessageTypeIndex
  amount: CosmosCoin[]
  fromAddress: string
  toAddress: string
}

interface CosmosFee {
  amount: CosmosCoin[]
  gas: string
}

export interface CosmosSignedTransaction extends SignedTransaction {
  encoded: string
}

export interface CosmosUnsignedTransaction extends UnsignedTransaction {
  messages: CosmosMessage[]
  fee: CosmosFee
  memo: string
  chainID: string
  accountNumber: string
  sequence: string
}

export interface CosmosTransactionCursor extends TransactionCursor {
  limit: number
  sender: {
    total: number
    offset: number
  }
  recipient: {
    total: number
    offset: number
  }
}
