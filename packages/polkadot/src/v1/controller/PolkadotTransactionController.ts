import { SubstrateCommonTransactionController } from '@airgap/substrate/v1'

import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { PolkadotProtocolConfiguration } from '../types/configuration'

export class PolkadotTransactionController extends SubstrateCommonTransactionController<
  PolkadotProtocolConfiguration,
  PolkadotNodeClient
> {}
