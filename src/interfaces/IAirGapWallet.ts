import { IAirGapTransaction } from './IAirGapTransaction'
import BigNumber from 'bignumber.js'
import { ICoinProtocol } from '../protocols/ICoinProtocol'

export interface IAirGapWallet {
  addresses: string[]
  coinProtocol: ICoinProtocol

  deriveAddresses(amount: number): Promise<string[]>
}
