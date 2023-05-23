import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SecretKey } from '@airgap/module-kit'

import { SubstrateAccountId } from '../../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../../data/account/address/SubstrateAddressFactory'
import { SubstrateTransaction, SubstrateTransactionType } from '../../data/transaction/SubstrateTransaction'
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SubstrateTransactionDetails, SubstrateTransactionParameters } from '../../types/transaction'

export interface SubstrateTransactionController<C extends SubstrateProtocolConfiguration> {
  prepareSubmittableTransactions(
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    available: BigNumber | string,
    params: SubstrateTransactionParameters<C>[]
  ): Promise<string>
  createTransaction(
    type: SubstrateTransactionType<C>,
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    tip?: string | number | BigNumber,
    args?: any,
    chainHeight?: number | BigNumber,
    nonce?: number | BigNumber
  ): Promise<SubstrateTransaction<C>>

  signTransaction(secretKey: SecretKey, transaction: SubstrateTransaction<C>, payload: string): Promise<SubstrateTransaction<C>>

  encodeDetails(txs: SubstrateTransactionDetails<C>[]): string
  decodeDetails(serialized: string): SubstrateTransactionDetails<C>[]

  calculateTransactionFee(transaction: SubstrateTransaction<C>): Promise<BigNumber | undefined>
  estimateTransactionFees(
    accountId: SubstrateAccountId<TypedSubstrateAddress<C>>,
    transationTypes: [SubstrateTransactionType<C>, any][]
  ): Promise<BigNumber | undefined>
}
