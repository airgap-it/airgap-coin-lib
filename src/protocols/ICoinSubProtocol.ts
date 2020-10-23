import { ICoinProtocol } from './ICoinProtocol'

export enum SubProtocolType {
  ACCOUNT = 'account',
  TOKEN = 'token'
}

export interface ICoinSubProtocol extends ICoinProtocol {
  isSubProtocol: boolean
  subProtocolType: SubProtocolType
  contractAddress?: string
}
