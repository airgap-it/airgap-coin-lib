import { Secp256K1CryptoConfiguration, Sr25519CryptoConfiguration } from '@airgap/module-kit'

import { SubstrateEthAccountConfiguration, SubstrateProtocolConfiguration, SubstrateSS58AccountConfiguration } from './configuration'

export type SubstrateCryptoConfiguration<
  C extends SubstrateProtocolConfiguration = SubstrateProtocolConfiguration
> = C extends SubstrateProtocolConfiguration<infer A>
  ? A extends SubstrateSS58AccountConfiguration
    ? Sr25519CryptoConfiguration
    : A extends SubstrateEthAccountConfiguration
    ? Secp256K1CryptoConfiguration
    : never
  : never
