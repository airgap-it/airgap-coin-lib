import { ICoinProtocol } from '../protocols/ICoinProtocol'

export interface IAirGapWallet { // TODO: Can this interface be removed?
  addresses: string[]
  protocol: ICoinProtocol

  deriveAddresses(amount: number): Promise<string[]>
}
