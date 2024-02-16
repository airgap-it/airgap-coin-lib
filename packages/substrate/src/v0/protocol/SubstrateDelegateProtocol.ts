import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import {
  DelegateeDetails,
  DelegationDetails,
  DelegatorDetails,
  ICoinDelegateProtocol
} from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

import { RawSubstrateTransaction } from '../types/transaction-substrate'
import { SubstratePayee } from './common/data/staking/SubstratePayee'
import { SubstrateStakingActionType } from './common/data/staking/SubstrateStakingActionType'
import { SubstrateTransactionType } from './common/data/transaction/SubstrateTransaction'
import { SubstrateTransactionConfig } from './common/SubstrateTransactionController'
import { SubstrateNetwork } from './SubstrateNetwork'
import { SubstrateProtocol } from './SubstrateProtocol'

export abstract class SubstrateDelegateProtocol<Network extends SubstrateNetwork>
  extends SubstrateProtocol<Network>
  implements ICoinDelegateProtocol
{
  protected defaultValidator?: string

  public async getDefaultDelegatee(): Promise<string> {
    if (this.defaultValidator) {
      return this.defaultValidator
    }

    const validators = await this.options.nodeClient.getValidators()

    return validators ? validators[0].asString() : ''
  }

  public async getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]> {
    return this.options.accountController.getCurrentValidators(publicKey)
  }

  public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
    return this.options.accountController.getCurrentValidators(address)
  }

  public async getDelegateeDetails(address: string): Promise<DelegateeDetails> {
    const validatorDetails = await this.options.accountController.getValidatorDetails(address)

    return {
      name: validatorDetails.name || '',
      status: validatorDetails.status || '',
      address
    }
  }

  public async isPublicKeyDelegating(publicKey: string): Promise<boolean> {
    return this.options.accountController.isDelegating(publicKey)
  }

  public async isAddressDelegating(address: string): Promise<boolean> {
    return this.options.accountController.isDelegating(address)
  }

  public async getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegatorDetailsFromAddress(address.address)
  }

  public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
    return this.options.accountController.getNominatorDetails(address)
  }

  public async getDelegationDetailsFromPublicKey(publicKey: string, delegatees: string[]): Promise<DelegationDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegationDetailsFromAddress(address.address, delegatees)
  }

  public async getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails> {
    const [nominatorDetails, validatorsDetails] = await Promise.all([
      this.options.accountController.getNominatorDetails(address, delegatees),
      Promise.all(delegatees.map((validator) => this.options.accountController.getValidatorDetails(validator)))
    ])

    nominatorDetails.rewards =
      nominatorDetails.delegatees.length > 0 && nominatorDetails.stakingDetails
        ? nominatorDetails.stakingDetails.rewards.map((reward) => ({
            index: reward.eraIndex,
            amount: reward.amount,
            timestamp: reward.timestamp
          }))
        : []

    return {
      delegator: nominatorDetails,
      delegatees: validatorsDetails
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public async prepareDelegatorActionFromPublicKey(
    publicKey: string,
    type: SubstrateStakingActionType,
    data?: any
  ): Promise<RawSubstrateTransaction[]> {
    if (!data) {
      data = {}
    }

    switch (type) {
      case SubstrateStakingActionType.BOND_NOMINATE:
        assertFields(`${type} action`, data, 'targets', 'value', 'payee')

        return this.prepareNomination(publicKey, data.tip || 0, data.targets, data.controller || publicKey, data.value, data.payee)
      case SubstrateStakingActionType.REBOND_NOMINATE:
        assertFields(`${type} action`, data, 'targets', 'value')

        return this.prepareRebondNominate(publicKey, data.tip || 0, data.targets, data.value)
      case SubstrateStakingActionType.NOMINATE:
        assertFields(`${type} action`, data, 'targets')

        return this.prepareNomination(publicKey, data.tip || 0, data.targets)
      case SubstrateStakingActionType.CANCEL_NOMINATION:
        return this.prepareScheduleUndelegate(publicKey, data.tip || 0, data.value)
      case SubstrateStakingActionType.CHANGE_NOMINATION:
        assertFields(`${type} action`, data, 'targets')

        return this.prepareChangeValidator(publicKey, data.tip || 0, data.targets)
      case SubstrateStakingActionType.UNBOND:
        assertFields(`${type} action`, data, 'value')

        return this.prepareUnbond(publicKey, data.tip || 0, data.value)
      case SubstrateStakingActionType.REBOND:
        assertFields(`${type} action`, data, 'value')

        return this.prepareRebond(publicKey, data.tip || 0, data.value)
      case SubstrateStakingActionType.BOND_EXTRA:
        assertFields(`${type} action`, data, 'value')

        return this.prepareBondExtra(publicKey, data.tip || 0, data.value)
      case SubstrateStakingActionType.REBOND_EXTRA:
        assertFields(`${type} action`, data, 'value')

        return this.prepareRebondExtra(publicKey, data.tip || 0, data.value)
      case SubstrateStakingActionType.WITHDRAW_UNBONDED:
        return this.prepareWithdrawUnbonded(publicKey, data.tip || 0)
      case SubstrateStakingActionType.CHANGE_REWARD_DESTINATION:
        return Promise.reject('Unsupported delegator action.')
      case SubstrateStakingActionType.CHANGE_CONTROLLER:
        return Promise.reject('Unsupported delegator action.')
      default:
        return Promise.reject('Unsupported delegator action.')
    }
  }

  public async prepareNomination(
    publicKey: string,
    tip: string | number | BigNumber,
    targets: string[] | string,
    controller?: string,
    value?: string | number | BigNumber,
    payee?: string | SubstratePayee
  ): Promise<RawSubstrateTransaction[]> {
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, false, false)
    const available = new BigNumber(transferableBalance).minus(value || 0)

    const bondFirst = controller !== undefined && value !== undefined && payee !== undefined

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, available, [
      ...(bondFirst
        ? [
            {
              type: SubstrateTransactionType.BOND,
              tip,
              args: {
                controller,
                value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!),
                payee: typeof payee === 'string' ? SubstratePayee[payee as keyof typeof SubstratePayee] : payee
              }
            }
          ]
        : []),
      {
        type: SubstrateTransactionType.NOMINATE,
        tip,
        args: {
          targets: typeof targets === 'string' ? [targets] : targets
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareRebondNominate(
    publicKey: string,
    tip: string | number | BigNumber,
    targets: string[] | string,
    value: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const [transferableBalance, lockedBalance] = await Promise.all([
      this.options.accountController.getTransferableBalance(publicKey, false, false),
      this.options.accountController.getUnlockingBalance(publicKey)
    ])

    const toDelegate = BigNumber.isBigNumber(value) ? value : new BigNumber(value)

    const configs: SubstrateTransactionConfig[] = []
    if (toDelegate.gt(lockedBalance)) {
      configs.push(
        {
          type: SubstrateTransactionType.REBOND,
          tip,
          args: {
            value: lockedBalance
          }
        },
        {
          type: SubstrateTransactionType.BOND_EXTRA,
          tip,
          args: {
            value: toDelegate.minus(lockedBalance)
          }
        }
      )
    } else {
      configs.push({
        type: SubstrateTransactionType.REBOND,
        tip,
        args: {
          value: toDelegate
        }
      })
    }
    configs.push({
      type: SubstrateTransactionType.NOMINATE,
      tip,
      args: {
        targets: typeof targets === 'string' ? [targets] : targets
      }
    })

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, configs)

    return [{ encoded }]
  }

  public async prepareScheduleUndelegate(
    publicKey: string,
    tip: string | number | BigNumber,
    value?: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, false, false)
    const keepController = value === undefined

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
      {
        type: SubstrateTransactionType.CANCEL_NOMINATION,
        tip,
        args: {}
      },
      ...(keepController
        ? []
        : [
            {
              type: SubstrateTransactionType.UNBOND,
              tip,
              args: {
                value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!)
              }
            }
          ])
    ])

    return [{ encoded }]
  }

  public async prepareChangeValidator(
    publicKey: string,
    tip: string | number | BigNumber,
    targets: string[] | string
  ): Promise<RawSubstrateTransaction[]> {
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, false, false)

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
      {
        type: SubstrateTransactionType.NOMINATE,
        tip,
        args: {
          targets: typeof targets === 'string' ? [targets] : targets
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareUnbond(
    publicKey: string,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, false, false)

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
      {
        type: SubstrateTransactionType.UNBOND,
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareRebond(
    publicKey: string,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, false, false)

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
      {
        type: SubstrateTransactionType.REBOND,
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareBondExtra(
    publicKey: string,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const transferableBalance = await this.options.accountController.getTransferableBalance(publicKey, false, false)

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
      {
        type: SubstrateTransactionType.BOND_EXTRA,
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return [{ encoded }]
  }

  public async prepareRebondExtra(
    publicKey: string,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<RawSubstrateTransaction[]> {
    const [transferableBalance, lockedBalance] = await Promise.all([
      this.options.accountController.getTransferableBalance(publicKey, false, false),
      this.options.accountController.getUnlockingBalance(publicKey)
    ])

    const toDelegate = BigNumber.isBigNumber(value) ? value : new BigNumber(value)

    const configs: SubstrateTransactionConfig[] = toDelegate.gt(lockedBalance)
      ? [
          {
            type: SubstrateTransactionType.REBOND,
            tip,
            args: {
              value: lockedBalance
            }
          },
          {
            type: SubstrateTransactionType.BOND_EXTRA,
            tip,
            args: {
              value: toDelegate.minus(lockedBalance)
            }
          }
        ]
      : [
          {
            type: SubstrateTransactionType.REBOND,
            tip,
            args: {
              value: toDelegate
            }
          }
        ]

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, configs)

    return [{ encoded }]
  }

  public async prepareWithdrawUnbonded(publicKey: string, tip: string | number | BigNumber): Promise<RawSubstrateTransaction[]> {
    const [transferableBalance, slashingSpansNumber] = await Promise.all([
      this.options.accountController.getTransferableBalance(publicKey, false, false),
      this.options.accountController.getSlashingSpansNumber(publicKey)
    ])

    const encoded = await this.options.transactionController.prepareSubmittableTransactions(publicKey, transferableBalance, [
      {
        type: SubstrateTransactionType.WITHDRAW_UNBONDED,
        tip,
        args: { slashingSpansNumber }
      }
    ])

    return [{ encoded }]
  }

  public async estimateMaxDelegationValueFromAddress(address: string): Promise<string> {
    const results = await Promise.all([
      this.options.accountController.getTransferableBalance(address, false, false),
      this.getFutureRequiredTransactions(address, 'delegate')
    ])

    const transferableBalance = results[0]
    const futureTransactions = results[1]

    const feeEstimate = await this.options.transactionController.estimateTransactionFees(address, futureTransactions)

    if (!feeEstimate) {
      return Promise.reject('Could not estimate max value.')
    }

    const maxValue = transferableBalance.minus(feeEstimate)

    return (maxValue.gte(0) ? maxValue : new BigNumber(0)).toString(10)
  }
}
