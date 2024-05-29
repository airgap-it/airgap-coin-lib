import { SubstrateCommonNodeClient } from '@airgap/substrate/v1'

import { AcurastProtocolConfiguration } from '../types/configuration'

export class AcurastNodeClient extends SubstrateCommonNodeClient<AcurastProtocolConfiguration> {}
