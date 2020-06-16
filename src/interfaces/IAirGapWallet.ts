import { ICoinProtocol } from '../protocols/ICoinProtocol'

export interface IAirGapWallet {
  addresses: string[]
  protocol: ICoinProtocol

  deriveAddresses(amount: number): Promise<string[]>
}
