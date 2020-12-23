import { RLPData } from '../utils/toBuffer'

export interface Payload {
  asArray(): RLPData
}
