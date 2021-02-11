import { ProtocolNetwork } from './ProtocolNetwork'

export const isNetworkEqual: (network1: ProtocolNetwork, network2: ProtocolNetwork) => boolean = (
  network1: ProtocolNetwork,
  network2: ProtocolNetwork
): boolean => {
  return network1.name === network2.name && network1.type === network2.type && network1.rpcUrl === network2.rpcUrl
}
