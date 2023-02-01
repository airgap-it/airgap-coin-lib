import { ProtocolNetwork } from '@airgap/module-kit'

export type ICPUnits = 'ICP'

export interface ICPProtocolNetwork extends ProtocolNetwork {
  explorerUrl: string
}

export interface ICPProtocolOptions {
  network: ICPProtocolNetwork
}
