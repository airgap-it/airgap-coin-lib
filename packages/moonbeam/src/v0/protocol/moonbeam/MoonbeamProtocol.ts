import { BigNumber } from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { DelegateeDetails, DelegationDetails, DelegatorDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'
import { CurrencyUnit, FeeDefaults } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { RawSubstrateTransaction } from '@airgap/substrate'
import { SubstrateTransactionType } from '@airgap/substrate/v0/protocol/common/data/transaction/SubstrateTransaction'
import { SubstrateAccountId } from '@airgap/substrate/v0/protocol/compat/SubstrateCompatAddress'
import { MoonbeamAddress } from '@airgap/substrate/v0/protocol/moonbeam/MoonbeamAddress'
import { SubstrateDelegateProtocol } from '@airgap/substrate/v0/protocol/SubstrateDelegateProtocol'
import { SubstrateNetwork } from '@airgap/substrate/v0/protocol/SubstrateNetwork'

import { MoonbeamStakingActionType } from './data/staking/MoonbeamStakingActionType'
import { MoonbeamProtocolNetwork, MoonbeamProtocolOptions } from './MoonbeamProtocolOptions'

export class MoonbeamProtocol extends SubstrateDelegateProtocol<SubstrateNetwork.MOONBEAM> {
  public symbol: string = 'GLMR'
  public name: string = 'Moonbeam'
  public marketSymbol: string = 'GLMR'
  public feeSymbol: string = 'GLMR'

  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: ProtocolSymbols = MainProtocolSymbols.MOONBEAM

  public feeDefaults: FeeDefaults = {
    low: '0.000000000125',
    medium: '0.000000000125',
    high: '0.000000000125'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'GLMR',
      factor: '1'
    },
    {
      unitSymbol: 'mGLMR',
      factor: '0.001'
    },
    {
      unitSymbol: 'uGLMR',
      factor: '0.000001'
    },
    {
      unitSymbol: 'GWEI',
      factor: '0.000000001'
    },
    {
      unitSymbol: 'MWEI',
      factor: '0.000000000001'
    },
    {
      unitSymbol: 'kWEI',
      factor: '0.000000000000001'
    },
    {
      unitSymbol: 'WEI',
      factor: '0.000000000000000001'
    }
  ]

  public standardDerivationPath: string = `m/44'/60'/0'/0/0`

  public addressIsCaseSensitive: boolean = false
  public addressValidationPattern: string = '^0x[a-fA-F0-9]{40}$'
  public addressPlaceholder: string = `0xabc...`

  public defaultValidator?: string

  public constructor(public readonly options: MoonbeamProtocolOptions = new MoonbeamProtocolOptions(new MoonbeamProtocolNetwork())) {
    super(options)
  }

  public async getDefaultDelegatee(): Promise<string> {
    if (this.defaultValidator) {
      return this.defaultValidator
    }
    const collators: MoonbeamAddress[] | undefined = await this.options.nodeClient.getCollators()

    return collators ? collators[0].asString() : ''
  }

  public async getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]> {
    return this.options.accountController.getCurrentCollators(publicKey)
  }

  public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
    return this.options.accountController.getCurrentCollators(address)
  }

  public async getDelegateeDetails(address: string): Promise<DelegateeDetails> {
    const collatorDetails = await this.options.accountController.getCollatorDetails(address)

    return {
      name: collatorDetails.name ?? '',
      status: collatorDetails.status ?? '',
      address: collatorDetails.address
    }
  }

  public async isPublicKeyDelegating(publicKey: string): Promise<boolean> {
    return this.options.accountController.isDelegating(publicKey)
  }

  public async isAddressDelegating(address: string): Promise<boolean> {
    return this.options.accountController.isDelegating(address)
  }

  public async getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails> {
    return this.options.accountController.getDelegatorDetails(publicKey)
  }

  public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
    return this.options.accountController.getDelegatorDetails(address)
  }

  public async getDelegationDetailsFromPublicKey(publicKey: string, delegatees: string[]): Promise<DelegationDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegationDetailsFromAddress(address.address, delegatees)
  }

  public async getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails> {
    if (delegatees.length > 1) {
      throw new UnsupportedError(Domain.SUBSTRATE, 'Multiple validators for a single delegation are not supported')
    }

    const collator = delegatees[0]
    const delegationDetails = await this.options.accountController.getDelegationDetails(address, collator)

    return {
      delegator: delegationDetails.delegatorDetails,
      delegatees: [delegationDetails.collatorDetails]
    }
  }

  public async prepareDelegatorActionFromPublicKey(publicKey: string, type: any, data?: any): Promise<any[]> {
    if (!data) {
      data = {}
    }

    switch (type) {
      case MoonbeamStakingActionType.DELEGATE:
        assertFields(`${type} action`, data, 'candidate', 'amount')

        return this.prepareDelegation(publicKey, data.tip ?? 0, data.candidate, data.amount)
      case MoonbeamStakingActionType.BOND_MORE:
        assertFields(`${type} action`, data, 'candidate', 'more')

        return this.prepareDelegatorBondMore(publicKey, data.tip ?? 0, data.candidate, data.more)

      case MoonbeamStakingActionType.SCHEDULE_BOND_LESS:
        assertFields(`${type} action`, data, 'candidate', 'less')

        return this.prepareScheduleDelegatorBondLess(publicKey, data.tip ?? 0, data.candidate, data.less)
      case MoonbeamStakingActionType.EXECUTE_BOND_LESS:
        assertFields(`${type} action`, data, 'candidate')

        return this.prepareExecuteDelegatorBondLess(publicKey, data.tip ?? 0, data.candidate)
      case MoonbeamStakingActionType.CANCEL_BOND_LESS:
        assertFields(`${type} action`, data, 'candidate')

        return this.prepareCancelDelegatorBondLess(publicKey, data.tip ?? 0, data.candidate)
      case MoonbeamStakingActionType.SCHEDULE_UNDELEGATE:
        assertFields(`${type} action`, data, 'collator')

        return this.prepareScheduleUndelegate(publicKey, data.tip ?? 0, data.collator)
      case MoonbeamStakingActionType.EXECUTE_UNDELEGATE:
        assertFields(`${type} action`, data, 'candidate')

        return this.prepareExecuteUndelegate(publicKey, data.tip ?? 0, data.candidate)
      case MoonbeamStakingActionType.CANCEL_UNDELEGATE:
        assertFields(`${type} action`, data, 'candidate')

        return this.prepareCancelUndelegate(publicKey, data.tip ?? 0, data.candidate)
      case MoonbeamStakingActionType.SCHEDULE_UNDELEGATE_ALL:
        return this.prepareScheduleUndelegateAll(publicKey, data.tip ?? 0)
      case MoonbeamStakingActionType.EXECUTE_UNDELEGATE_ALL:
        return this.prepareExecuteUndelegateAll(publicKey, data.tip ?? 0)
      case MoonbeamStakingActionType.CANCEL_UNDELEGATE_ALL:
        return this.prepareCancelUndelegateAll(publicKey, data.tip ?? 0)
      default:
        throw new UnsupportedError(Domain.SUBSTRATE, 'Unsupported delegator action.')
    }
  }

  public async prepareDelegation(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string,
    amount: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const requestedAmount = new BigNumber(amount)
    const minAmount = await this.getMinDelegationAmount(publicKey)
    if (requestedAmount.lt(minAmount)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `The amount is too low, it has to be at least ${minAmount.toString()}`)
    }

    const results = await Promise.all([
      this.options.accountController.getDelegatorDetails(publicKey),
      this.options.accountController.getCollatorDetails(candidate),
      this.options.nodeClient.getMaxDelegationsPerDelegator(),
      this.getBalanceOfPublicKey(publicKey)
    ])

    const delegatorDetails = results[0]
    const collatorDetails = results[1]
    const maxDelegations = results[2]
    const balance = results[3]

    if (maxDelegations?.lte(delegatorDetails.delegatees.length)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'This delegator cannot nominate more collators.')
    }

    const available = new BigNumber(balance).minus(amount)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, available, [
      {
        type: SubstrateTransactionType.M_DELEGATE,
        tip,
        args: {
          candidate,
          amount: new BigNumber(amount),
          candidateDelegationCount: collatorDetails.delegators,
          delegationCount: delegatorDetails.delegatees.length
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareScheduleUndelegate(
    publicKey: string,
    tip: string | number | BigNumber,
    collator: string
  ): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_SCHEDULE_REVOKE_DELGATION,
        tip,
        args: {
          collator
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareExecuteUndelegate(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<RawSubstrateTransaction[]> {
    return this.prepareExecuteDelegationRequest(publicKey, tip, candidate)
  }

  public async prepareCancelUndelegate(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<RawSubstrateTransaction[]> {
    return this.prepareCancelDelegationRequest(publicKey, tip, candidate)
  }

  public async prepareScheduleUndelegateAll(publicKey: string, tip: string | number | BigNumber): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_SCHEDULE_LEAVE_DELEGATORS,
        tip,
        args: {}
      }
    ])

    return [{ encoded }]
  }

  public async prepareExecuteUndelegateAll(publicKey: string, tip: string | number | BigNumber): Promise<RawSubstrateTransaction[]> {
    const results = await Promise.all([
      this.options.accountController.getDelegatorDetails(publicKey),
      this.getBalanceOfPublicKey(publicKey),
      this.getAddressFromPublicKey(publicKey)
    ])

    const delegatorDetails = results[0]
    const balance = results[1]
    const delegator = results[2].address

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_EXECUTE_LEAVE_DELEGATORS,
        tip,
        args: {
          delegator,
          delegationCount: delegatorDetails.delegatees.length
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareCancelUndelegateAll(publicKey: string, tip: string | number | BigNumber): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_CANCEL_LEAVE_DELEGATORS,
        tip,
        args: {}
      }
    ])

    return [{ encoded }]
  }

  public async prepareDelegatorBondMore(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string,
    more: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const available = new BigNumber(balance).minus(more)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, available, [
      {
        type: SubstrateTransactionType.M_DELEGATOR_BOND_MORE,
        tip,
        args: {
          candidate,
          more: new BigNumber(more)
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareScheduleDelegatorBondLess(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string,
    less: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const [balance, delegationDetails] = await Promise.all([
      this.getBalanceOfPublicKey(publicKey),
      this.options.accountController.getDelegationDetails(publicKey, candidate)
    ])
    const bondAmount = new BigNumber(delegationDetails.bond)
    const requestedAmount = new BigNumber(less)
    if (requestedAmount.gt(bondAmount)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'Bond less amount too high')
    } else if (requestedAmount.eq(bondAmount)) {
      return this.prepareScheduleUndelegate(publicKey, tip, candidate)
    }

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_SCHEDULE_DELEGATOR_BOND_LESS,
        tip,
        args: {
          candidate,
          less: requestedAmount
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareExecuteDelegatorBondLess(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<RawSubstrateTransaction[]> {
    return this.prepareExecuteDelegationRequest(publicKey, tip, candidate)
  }

  public async prepareCancelDelegatorBondLess(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<RawSubstrateTransaction[]> {
    return this.prepareCancelDelegationRequest(publicKey, tip, candidate)
  }

  private async prepareExecuteDelegationRequest(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<RawSubstrateTransaction[]> {
    const results = await Promise.all([this.getBalanceOfPublicKey(publicKey), this.getAddressFromPublicKey(publicKey)])

    const balance = results[0]
    const delegator = results[1].address

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_EXECUTE_DELGATION_REQUEST,
        tip,
        args: {
          delegator,
          candidate
        }
      }
    ])

    return [{ encoded }]
  }

  private async prepareCancelDelegationRequest(
    publicKey: string,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<RawSubstrateTransaction[]> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, balance, [
      {
        type: SubstrateTransactionType.M_CANCEL_DELEGATION_REQUEST,
        tip,
        args: {
          candidate
        }
      }
    ])

    return [{ encoded }]
  }

  public async getMinDelegationAmount(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<string> {
    return this.options.accountController.getMinDelegationAmount(accountId)
  }

  public async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<MoonbeamAddress>,
    intention: 'check' | 'transfer' | 'delegate'
  ): Promise<[SubstrateTransactionType, any][]> {
    const results = await Promise.all([
      this.options.accountController.isDelegating(accountId),
      this.options.accountController.getTransferableBalance(accountId),
      this.options.accountController.getTransferableBalance(accountId, false, false)
    ])

    const isDelegating = results[0]
    const transferableBalance = results[1]
    const stakingBalance = results[2]

    const requiredTransactions: [SubstrateTransactionType, any][] = []

    if (intention === 'transfer') {
      requiredTransactions.push([
        SubstrateTransactionType.TRANSFER,
        {
          to: MoonbeamAddress.getPlaceholder(),
          value: transferableBalance
        }
      ])
    }
    if (!isDelegating && intention === 'delegate') {
      // not delegated
      requiredTransactions.push(
        [
          SubstrateTransactionType.M_DELEGATE,
          {
            candidate: MoonbeamAddress.getPlaceholder(),
            amount: stakingBalance,
            candidateDelegationCount: 0,
            delegationCount: 0
          }
        ],
        [
          SubstrateTransactionType.M_SCHEDULE_REVOKE_DELGATION,
          {
            collator: MoonbeamAddress.getPlaceholder()
          }
        ],
        [
          SubstrateTransactionType.M_EXECUTE_DELGATION_REQUEST,
          {
            delegator: MoonbeamAddress.getPlaceholder(),
            candidate: MoonbeamAddress.getPlaceholder()
          }
        ]
      )
    }

    if (isDelegating && intention === 'delegate') {
      requiredTransactions.push(
        [
          SubstrateTransactionType.M_SCHEDULE_REVOKE_DELGATION,
          {
            collator: MoonbeamAddress.getPlaceholder()
          }
        ],
        [
          SubstrateTransactionType.M_EXECUTE_DELGATION_REQUEST,
          {
            delegator: MoonbeamAddress.getPlaceholder(),
            candidate: MoonbeamAddress.getPlaceholder()
          }
        ]
      )
    }

    return requiredTransactions
  }
}
