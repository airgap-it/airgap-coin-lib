export interface HasConfigurableContract {
  getContractAddress(): Promise<string | undefined>
  setContractAddress(address: string, configuration?: any): Promise<void>
}
