import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { TypedSubstrateAddress } from '../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountInfo } from '../data/account/SubstrateAccountInfo'
import { SubstrateCall } from '../data/metadata/decorator/call/SubstrateCall'
import { SubstrateRuntimeVersion } from '../data/state/SubstrateRuntimeVersion'
import { SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'
import { SubstrateProtocolConfiguration } from '../types/configuration'

export interface SubstrateNodeClient<C extends SubstrateProtocolConfiguration> {
  getAccountInfo(address: TypedSubstrateAddress<C>): Promise<SubstrateAccountInfo | undefined>
  getExistentialDeposit(): Promise<BigNumber | undefined>

  getBlockTime(): Promise<BigNumber>
  getFirstBlockHash(): Promise<string | undefined>
  getLastBlockHash(): Promise<string | undefined>
  getCurrentHeight(): Promise<BigNumber>

  getRuntimeVersion(): Promise<SubstrateRuntimeVersion | undefined>

  getTransferFeeEstimate(transaction: Uint8Array | string): Promise<BigNumber | undefined>
  saveLastFee(type: SubstrateTransactionType<C>, fee: BigNumber): void
  getSavedLastFee(type: SubstrateTransactionType<C>, defaultValue: 'undefined' | 'largest'): BigNumber | undefined

  getTransactionMetadata(type: SubstrateTransactionType<C>): Promise<SubstrateCall>
  submitTransaction(encoded: string): Promise<string>
}
