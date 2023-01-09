import { Serializer } from '../serializer'
import { RLPData } from '../utils/toBuffer'

export interface Payload {
  asArray(serializer?: Serializer): RLPData
}
