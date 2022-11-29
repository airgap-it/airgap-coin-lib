import { ProtocolNetwork } from '@airgap/module-kit'

export type AeternityUnits = 'AE'

export interface AeternityProtocolNetwork extends ProtocolNetwork {
  feesUrl: string
}

export interface AeternityProtocolOptions {
  network: AeternityProtocolNetwork
}
