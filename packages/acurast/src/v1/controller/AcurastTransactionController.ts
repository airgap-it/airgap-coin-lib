import { SubstrateCommonTransactionController } from '@airgap/substrate/v1'

import { AcurastNodeClient } from '../node/AcurastNodeClient'
import { AcurastProtocolConfiguration } from '../types/configuration'

export class AcurastTransactionController extends SubstrateCommonTransactionController<AcurastProtocolConfiguration, AcurastNodeClient> {}
