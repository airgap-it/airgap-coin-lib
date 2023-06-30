import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { SubstrateAccountController } from '../controller/account/SubstrateAccountController'
import { SubstrateTransactionController } from '../controller/transaction/SubstrateTransactionController'
import { SubstrateAccountId } from '../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../data/account/address/SubstrateAddressFactory'
import { SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'
import { SubstrateNodeClient } from '../node/SubstrateNodeClient'
import { SubstrateProtocolConfiguration } from '../types/configuration'
import { SubstrateCryptoConfiguration } from '../types/crypto'
import { SubstrateProtocolNetwork } from '../types/protocol'

import { SubstrateProtocol, SubstrateProtocolImpl } from './SubstrateProtocol'

// Interface

export interface SubstrateStakingProtocol<
  _ProtocolConfiguration extends SubstrateProtocolConfiguration = SubstrateProtocolConfiguration,
  _Units extends string = string,
  _ProtocolNetwork extends SubstrateProtocolNetwork = SubstrateProtocolNetwork,
  _CryptoConfiguration extends SubstrateCryptoConfiguration = SubstrateCryptoConfiguration
> extends SubstrateProtocol<_ProtocolConfiguration, _Units, _ProtocolNetwork, _CryptoConfiguration> {
  getMaxDelegationValueWithAddress(address: string): Promise<string>
}

// Implementation

export abstract class SubstrateStakingProtocolImpl<
    _Units extends string,
    _ProtocolConfiguration extends SubstrateProtocolConfiguration,
    _ProtocolNetwork extends SubstrateProtocolNetwork = SubstrateProtocolNetwork,
    _NodeClient extends SubstrateNodeClient<_ProtocolConfiguration> = SubstrateNodeClient<_ProtocolConfiguration>,
    _AccountController extends SubstrateAccountController<_ProtocolConfiguration> = SubstrateAccountController<_ProtocolConfiguration>,
    _TransactionController extends SubstrateTransactionController<_ProtocolConfiguration> = SubstrateTransactionController<_ProtocolConfiguration>
  >
  extends SubstrateProtocolImpl<_Units, _ProtocolConfiguration, _ProtocolNetwork, _NodeClient, _AccountController, _TransactionController>
  implements
    SubstrateStakingProtocol<_ProtocolConfiguration, _Units, _ProtocolNetwork, SubstrateCryptoConfiguration<_ProtocolConfiguration>>
{
  public async getMaxDelegationValueWithAddress(address: string): Promise<string> {
    const [balance, futureTransactions] = await Promise.all([
      this.accountController.getBalance(address),
      this.getFutureRequiredTransactions(address, 'delegate')
    ])

    const feeEstimate = await this.transactionController.estimateTransactionFees(address, futureTransactions)

    if (!feeEstimate) {
      return Promise.reject('Could not estimate max value.')
    }

    const maxValue = balance.transferable.minus(feeEstimate)

    return (maxValue.gte(0) ? maxValue : new BigNumber(0)).toString(10)
  }

  protected abstract getFutureRequiredTransactions(
    accountId: SubstrateAccountId<TypedSubstrateAddress<_ProtocolConfiguration>>,
    intention: 'transfer' | 'check' | 'delegate'
  ): Promise<[SubstrateTransactionType<_ProtocolConfiguration>, any][]>
}
