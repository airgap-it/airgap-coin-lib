import { Address } from '../../../types/address'
import { SubProtocolType } from '../../../types/sub-protocol'
import { _AnyProtocol } from '../../protocol'

import { SubProtocol } from './SubProtocolExtension'

export type SingleTokenSubProtocolExtension<_T extends _AnyProtocol> = SingleTokenSubProtocol

export interface SingleTokenSubProtocol extends SubProtocol {
  getType(): Promise<Extract<SubProtocolType, 'token'>>
  getContractAddress(): Promise<Address>
}
