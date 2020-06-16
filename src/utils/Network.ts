export enum NetworkType {
  MAINNET = 'MAINNET',
  TESTNET = 'TESTNET',
  CUSTOM = 'CUSTOM'
}

export interface ChainNetwork {
  type: NetworkType
  name: string
  rpcUrl: string
}

export const isNetworkEqual: (network1: ChainNetwork, network2: ChainNetwork) => boolean = (
  network1: ChainNetwork,
  network2: ChainNetwork
): boolean => {
  return network1.name === network2.name && network1.type === network2.type && network1.name === network2.name
}
