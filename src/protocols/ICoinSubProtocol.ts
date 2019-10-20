export enum SubProtocolType {
  ACCOUNT = 'account',
  TOKEN = 'token'
}

export interface ICoinSubProtocol {
  isSubProtocol: boolean
  subProtocolType: SubProtocolType
}
