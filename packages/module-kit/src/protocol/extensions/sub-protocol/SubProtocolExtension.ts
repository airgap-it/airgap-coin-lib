import { SubProtocolType } from '../../../types/sub-protocol'
import { AnyProtocol } from '../../protocol'

export type SubProtocolExtension<T extends AnyProtocol> = SubProtocol

export interface SubProtocol {
  getType(): Promise<SubProtocolType>
}
