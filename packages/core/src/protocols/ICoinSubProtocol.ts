import { ICoinProtocol } from './ICoinProtocol'

export enum SubProtocolType {
  ACCOUNT = 'account',
  TOKEN = 'token'
}

export interface ICoinSubProtocol extends ICoinProtocol {
  /**
   * @deprecated Use `getIsSubProtocol()` instead.
   */
  isSubProtocol: boolean

  /**
   * @deprecated Use `getSubProtocolType()` instead.
   */
  subProtocolType: SubProtocolType

  /**
   * @deprecated Use `getContractAddress()` instead.
   */
  contractAddress?: string

  getIsSubProtocol(): Promise<boolean>
  getSubProtocolType(): Promise<SubProtocolType>
  getContractAddress(): Promise<string | undefined>
}
