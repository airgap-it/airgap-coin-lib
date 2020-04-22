import { ICoinProtocol } from "./ICoinProtocol";

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
    collected: boolean
    timestamp: number
}

export interface DelegationDetails {
    delegator: DelegatorDetails
    delegatees: DelegateeDetails[]
}

export interface ICoinDelegateProtocol extends ICoinProtocol {
    getDefaultDelegatee(): Promise<string>
    getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]>
    getCurrentDelegateesForAddress(address: string): Promise<string[]>

    getDelegateeDetails(address: string): Promise<DelegateeDetails>

    isPublicKeyDelegating(publicKey: string): Promise<boolean>
    isAddressDelegating(address: string): Promise<boolean>

    getDelegationDetailsFromPublicKey(publicKey: string, delegatees: string[]): Promise<DelegationDetails>
    getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails>

    prepareDelegatorActionFromPublicKey(publicKey: string, type: any, data?: any): Promise<any[]>
}