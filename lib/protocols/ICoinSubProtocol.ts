export enum SubProtocolType {
  ACCOUNT,
  TOKEN
}

export interface ICoinSubProtocol {
  isSubProtocol: boolean
  subProtocolType: SubProtocolType
  subProtocolConfiguration: Object
}
