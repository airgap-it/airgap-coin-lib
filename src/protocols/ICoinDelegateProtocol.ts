import { ICoinProtocol } from "./ICoinProtocol";

export interface DelegateeDetails {
    name: string
    address: string
}

export interface DelegatorActions {
    type: any
    args: string[]
}

export interface DelegatorDetails {
    balance: string
    isDelegating: boolean,
    availableActions: DelegatorActions[]
}

export interface ICoinDelegateProtocol extends ICoinProtocol {
    getDelegateeDetails(address: string): Promise<DelegateeDetails>
    
    getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails>
    getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails>

    prepareDelegatorActionFromPublicKey(publicKey: string, type: any, data?: any): Promise<any>
}