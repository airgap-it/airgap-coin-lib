import { RLPData } from '../utils/toBuffer'

export enum PayloadType {
  DECODED = 0,
  ENCODED = 1
}

export interface Payload {
  asArray(): RLPData
}
