import { SubstrateCommonAccountController } from '@airgap/substrate/v1'

import { AcurastNodeClient } from '../node/AcurastNodeClient'
import { AcurastProtocolConfiguration } from '../types/configuration'

export class AcurastAccountController extends SubstrateCommonAccountController<AcurastProtocolConfiguration, AcurastNodeClient> {}
