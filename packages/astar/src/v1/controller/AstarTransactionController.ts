import { SubstrateCommonTransactionController } from '@airgap/substrate/v1'
import { AstarNodeClient } from '../node/AstarNodeClient'
import { AstarProtocolConfiguration } from '../types/configuration'

export class AstarTransactionController extends SubstrateCommonTransactionController<AstarProtocolConfiguration, AstarNodeClient> {}
