import { Address } from '../../../types/address'
import { SubProtocolType } from '../../../types/sub-protocol'
import { AnyProtocol } from '../../protocol'

import { SubProtocol } from './SubProtocolExtension'

export type ContractSubProtocolExtension<T extends AnyProtocol> = ContractSubProtocol

export interface ContractSubProtocol extends SubProtocol {
  getType(): Promise<Extract<SubProtocolType, 'token'>>
  getContractAddress(): Promise<Address>
}
