import { ProtocolMetadata, ProtocolNetwork } from '@airgap/module-kit'

import { SubstrateProtocolConfiguration } from './configuration'

export interface SubstrateProtocolNetwork extends ProtocolNetwork {}

export interface SubstrateProtocolOptions<
  _Units extends string,
  _ProtocolConfiguration extends SubstrateProtocolConfiguration,
  _ProtocolNetwork extends SubstrateProtocolNetwork
> {
  metadata: ProtocolMetadata<_Units>
  configuration: _ProtocolConfiguration
  network: _ProtocolNetwork
}
