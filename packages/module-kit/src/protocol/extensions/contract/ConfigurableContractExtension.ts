import { AnyProtocol } from '../../protocol'

export type ConfigurableContractExtension<T extends AnyProtocol> = ConfigurableContractProtocol

export interface ConfigurableContractProtocol {
  isContractValid(address: string): Promise<boolean>
  getContractAddress(): Promise<string | undefined>
  setContractAddress(address: string): Promise<void>
}
