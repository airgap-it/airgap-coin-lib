import { ICoinProtocol } from './ICoinProtocol'

export interface DelegateeDetails {
  name?: string
  status?: any
  address: string
}

export interface DelegatorAction {
  type: any
  args?: string[]
}

export interface DelegatorDetails {
  address: string
  balance: string
  delegatees: string[]
  availableActions?: DelegatorAction[]
  rewards?: DelegatorReward[]
}

export interface DelegatorReward {
  index: number
  amount: string
  collected?: boolean
  timestamp: number
}

export interface DelegationDetails {
  delegator: DelegatorDetails
  delegatees: DelegateeDetails[]
}

export interface ICoinDelegateProtocol extends ICoinProtocol {
  getDefaultDelegatee(): Promise<string>
  getCurrentDelegateesForPublicKey(publicKey: string, data?: any): Promise<string[]>
  getCurrentDelegateesForAddress(address: string, data?: any): Promise<string[]>

  getDelegateeDetails(address: string, data?: any): Promise<DelegateeDetails>

  isPublicKeyDelegating(publicKey: string, data?: any): Promise<boolean>
  isAddressDelegating(address: string, data?: any): Promise<boolean>

  getDelegatorDetailsFromPublicKey(publicKey: string, data?: any): Promise<DelegatorDetails>
  getDelegatorDetailsFromAddress(address: string, data?: any): Promise<DelegatorDetails>

  getDelegationDetailsFromPublicKey(publicKey: string, delegatees: string[], data?: any): Promise<DelegationDetails>
  getDelegationDetailsFromAddress(address: string, delegatees: string[], data?: any): Promise<DelegationDetails>

  prepareDelegatorActionFromPublicKey(publicKey: string, type: any, data?: any): Promise<any[]>
}
