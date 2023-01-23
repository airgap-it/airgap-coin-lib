import { SubProtocolType } from '../../../types/sub-protocol'
import { _AnyProtocol } from '../../protocol'

export type SubProtocolExtension<_T extends _AnyProtocol> = SubProtocol

export interface SubProtocol {
  getType(): Promise<SubProtocolType>
  mainProtocol(): Promise<string>
}
