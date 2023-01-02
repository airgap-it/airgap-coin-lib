import { _OnlineProtocol } from '../../protocol'

export type ConfigurableTransactionInjectorExtension<T extends _OnlineProtocol> = ConfigurableTransactionInjectorProtocol

export interface ConfigurableTransactionInjectorProtocol {
  getInjectorUrl(): Promise<string | undefined>
  setInjectorUrl(url: string): Promise<void>
}
