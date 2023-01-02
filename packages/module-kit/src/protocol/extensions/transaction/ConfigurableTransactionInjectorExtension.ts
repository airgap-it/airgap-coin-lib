import { OnlineProtocol } from '../../protocol'

export type ConfigurableTransactionInjectorExtension<T extends OnlineProtocol> = ConfigurableTransactionInjectorProtocol

export interface ConfigurableTransactionInjectorProtocol {
  getInjectorUrl(): Promise<string | undefined>
  setInjectorUrl(url: string): Promise<void>
}
