import { EthereumProtocolNetwork, EthereumProtocolOptions } from '@airgap/ethereum/v1'

export type BnbUnits = 'BNB' | 'GWEI' | 'JAGER'

export interface BnbProtocolNetwork extends EthereumProtocolNetwork {}

export interface BnbProtocolOptions extends EthereumProtocolOptions<BnbProtocolNetwork> {}
