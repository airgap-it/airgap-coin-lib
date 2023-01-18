import { _AnyProtocol } from '../../protocol'

export type ConfigurableContractExtension<_T extends _AnyProtocol> = ConfigurableContractProtocol

export interface ConfigurableContractProtocol {
  isContractValid(address: string): Promise<boolean>
  getContractAddress(): Promise<string | undefined>
  setContractAddress(address: string): Promise<void>
}
