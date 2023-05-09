import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

export interface ICPTransaction {
  actionType: ICPActionType
  encoded: string
}

export interface ICPUnsignedTransaction extends UnsignedTransaction {
  transactions: ICPTransaction[]
}

export interface ICPSignedTransaction extends SignedTransaction {
  transactions: ICPTransaction[]
}

export interface ICPTransactionCursor extends TransactionCursor {
  next: string
}

export enum ICPActionType {
  TRANSFER = 'TRANSFER',
  GET_NEURON_INFO = 'GET_NEURON_INFO',
  TRANSFER_TO_SUBACCOUNT = 'TRANSFER_TO_SUBACCOUNT',
  CLAIM_GOVERNANCE = 'CLAIM_GOVERNANCE',
  FOLLOW_NEURON = 'FOLLOW_NEURON',
  DISBURSE = 'DISBURSE',
  INCREASE_DISSOLVE_DELAY = 'INCREASE_DISSOLVE_DELAY',
  START_DISSOLVING = 'START_DISSOLVING',
  STOP_DISSOLVING = 'STOP_DISSOLVING',
  AUTO_STAKE_MATURITY = 'AUTO_STAKE_MATURITY'
}

export type ICPRequestType = 'query' | 'call'
export type ICPCanisterType = 'ledger' | 'governance'

export const ICP_REQUEST_TYPE_PER_ACTION: Record<ICPActionType, ICPRequestType> = {
  [ICPActionType.TRANSFER]: 'call',
  [ICPActionType.GET_NEURON_INFO]: 'query',
  [ICPActionType.TRANSFER_TO_SUBACCOUNT]: 'call',
  [ICPActionType.CLAIM_GOVERNANCE]: 'call',
  [ICPActionType.FOLLOW_NEURON]: 'call',
  [ICPActionType.DISBURSE]: 'call',
  [ICPActionType.INCREASE_DISSOLVE_DELAY]: 'call',
  [ICPActionType.START_DISSOLVING]: 'call',
  [ICPActionType.STOP_DISSOLVING]: 'call',
  [ICPActionType.AUTO_STAKE_MATURITY]: 'call'
}

export const ICP_CANISTER_TYPE_PER_ACTION: Record<ICPActionType, ICPCanisterType> = {
  [ICPActionType.TRANSFER]: 'ledger',
  [ICPActionType.GET_NEURON_INFO]: 'governance',
  [ICPActionType.TRANSFER_TO_SUBACCOUNT]: 'ledger',
  [ICPActionType.CLAIM_GOVERNANCE]: 'governance',
  [ICPActionType.FOLLOW_NEURON]: 'governance',
  [ICPActionType.DISBURSE]: 'governance',
  [ICPActionType.INCREASE_DISSOLVE_DELAY]: 'governance',
  [ICPActionType.START_DISSOLVING]: 'governance',
  [ICPActionType.STOP_DISSOLVING]: 'governance',
  [ICPActionType.AUTO_STAKE_MATURITY]: 'governance'
}
