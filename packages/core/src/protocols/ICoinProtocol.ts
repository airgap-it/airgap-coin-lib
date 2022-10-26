import { ICoinOfflineProtocol } from './ICoinOfflineProtocol'
import { ICoinOnlineProtocol } from './ICoinOnlineProtocol'

export { FeeDefaults } from './ICoinBaseProtocol'

export interface CurrencyUnit {
  unitSymbol: string
  factor: string
}

export interface ICoinProtocol extends ICoinOnlineProtocol, ICoinOfflineProtocol {}
