import { Address } from '../../../types/address'
import { SubProtocolType } from '../../../types/sub-protocol'
import { AnyProtocol } from '../../protocol'

import { SubProtocol } from './SubProtocolExtension'

export type ContractProtocolExtension<T extends AnyProtocol> = ContractProtocol

export interface ContractProtocol extends SubProtocol {
  getType(): Promise<Extract<SubProtocolType, 'token'>>
  getContractAddress(): Promise<Address>
}
