import { SubstrateCommonTransactionController } from '@airgap/substrate/v1'

import { MoonbeamNodeClient } from '../node/MoonbeamNodeClient'
import { MoonbeamProtocolConfiguration } from '../types/configuration'

export class MoonbeamTransactionController extends SubstrateCommonTransactionController<
  MoonbeamProtocolConfiguration,
  MoonbeamNodeClient
> {}
