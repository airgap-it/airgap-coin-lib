import { SubstrateCommonAccountController } from '@airgap/substrate/v1'

import { AstarNodeClient } from '../node/AstarNodeClient'
import { AstarProtocolConfiguration } from '../types/configuration'

export class AstarAccountController extends SubstrateCommonAccountController<AstarProtocolConfiguration, AstarNodeClient> {}
