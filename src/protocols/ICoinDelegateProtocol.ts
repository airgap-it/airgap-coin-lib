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
    balance: string
    isDelegating: boolean
    availableActions?: DelegatorAction[]
    rewards?: DelegatorReward[]
}

export interface DelegatorReward {
    index: number
    amount: string
    collected: boolean
    timestamp: number
}

export interface ICoinDelegateProtocol extends ICoinProtocol {
    supportsMultipleDelegatees: boolean

    getDefaultDelegatee(): Promise<string>
    getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]>
    getCurrentDelegateesForAddress(address: string): Promise<string[]>

    getDelegateesDetails(addresses: string[]): Promise<DelegateeDetails[]>

    isPublicKeyDelegating(publicKey: string): Promise<boolean>
    isAddressDelegating(address: string): Promise<boolean>

    getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails>
    getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails>

    prepareDelegatorActionFromPublicKey(publicKey: string, type: any, data?: any): Promise<any[]>
}