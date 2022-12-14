import { SubstrateCommonNodeClient } from '@airgap/substrate/v1'
import { AstarProtocolConfiguration } from '../types/configuration'

export class AstarNodeClient extends SubstrateCommonNodeClient<AstarProtocolConfiguration> {}
