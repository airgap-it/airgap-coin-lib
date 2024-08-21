import { DelegateeDetails, DelegationDetails, DelegatorDetails } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { Amount, newAmount, newUnsignedTransaction, PublicKey } from '@airgap/module-kit'
import { AirGapDelegateProtocol } from '@airgap/module-kit/internal'
import {
  SubscanBlockExplorerClient,
  SubstrateAccountId,
  SubstrateSS58Address,
  SubstrateStakingProtocol,
  SubstrateStakingProtocolImpl,
  SubstrateTransactionParameters,
  SubstrateTransactionType,
  SubstrateUnsignedTransaction
} from '@airgap/substrate/v1'

import { PolkadotAccountController } from '../controller/PolkadotAccountController'
import { PolkadotTransactionController } from '../controller/PolkadotTransactionController'
import { PolkadotNominationStatus } from '../data/staking/PolkadotNominationStatus'
import { PolkadotNominatorDetails } from '../data/staking/PolkadotNominatorDetails'
import { PolkadotPayee } from '../data/staking/PolkadotPayee'
import { PolkadotStakingActionType } from '../data/staking/PolkadotStakingActionType'
import { PolkadotStakingBalance } from '../data/staking/PolkadotStakingBalance'
import { PolkadotValidatorDetails } from '../data/staking/PolkadotValidatorDetails'
import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { PolkadotProtocolConfiguration } from '../types/configuration'
import { PolkadotCryptoConfiguration } from '../types/crypto'
import { PolkadotBaseProtocolOptions, PolkadotProtocolNetwork } from '../types/protocol'

// Interface

export interface PolkadotBaseProtocol<_Units extends string = string>
  extends SubstrateStakingProtocol<PolkadotProtocolConfiguration, _Units, PolkadotProtocolNetwork, PolkadotCryptoConfiguration>,
    AirGapDelegateProtocol {
  getNominatorDetails(address: string, validators?: string[]): Promise<PolkadotNominatorDetails>
  getValidatorDetails(address: string): Promise<PolkadotValidatorDetails>
  getNominationStatus(address: string, validator: string, era?: number): Promise<PolkadotNominationStatus | undefined>

  getStakingBalance(address: string): Promise<PolkadotStakingBalance<Amount<_Units>> | undefined>
  getMinNominatorBond(): Promise<Amount<_Units>>

  getExistentialDeposit(): Promise<Amount<_Units>>

  getFutureStakingTransactionsFee(address: string): Promise<Amount<_Units>>
}

// Implementation

export abstract class PolkadotBaseProtocolImpl<_Units extends string>
  extends SubstrateStakingProtocolImpl<
    _Units,
    PolkadotProtocolConfiguration,
    PolkadotProtocolNetwork,
    PolkadotNodeClient,
    PolkadotAccountController,
    PolkadotTransactionController
  >
  implements PolkadotBaseProtocol<_Units>
{
  protected readonly defaultValidator?: string

  public constructor(options: PolkadotBaseProtocolOptions<_Units>) {
    const nodeClient: PolkadotNodeClient = new PolkadotNodeClient(options.configuration, options.network.rpcUrl)

    const accountController: PolkadotAccountController = new PolkadotAccountController(options.configuration, nodeClient)
    const transactionController: PolkadotTransactionController = new PolkadotTransactionController(options.configuration, nodeClient)

    const blockExplorer: SubscanBlockExplorerClient = new SubscanBlockExplorerClient(options.network.blockExplorerApi)

    super(options, nodeClient, accountController, transactionController, blockExplorer)

    this.defaultValidator = options.network.defaultValidator
  }

  // Staking

  public async getDefaultDelegatee(): Promise<string> {
    if (this.defaultValidator) {
      return this.defaultValidator
    }

    const validators = await this.nodeClient.getValidators()

    return validators ? validators[0].asString() : ''
  }

  public async getCurrentDelegateesForPublicKey(publicKey: PublicKey): Promise<string[]> {
    return this.accountController.getCurrentValidators(publicKey)
  }

  public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
    return this.accountController.getCurrentValidators(address)
  }

  public async getDelegateeDetails(address: string): Promise<DelegateeDetails> {
    const validatorDetails = await this.accountController.getValidatorDetails(address)

    return {
      name: validatorDetails.name || '',
      status: validatorDetails.status || '',
      address
    }
  }

  public async isPublicKeyDelegating(publicKey: PublicKey): Promise<boolean> {
    return this.accountController.isDelegating(publicKey)
  }

  public async isAddressDelegating(address: string): Promise<boolean> {
    return this.accountController.isDelegating(address)
  }

  public async getDelegatorDetailsFromPublicKey(publicKey: PublicKey): Promise<DelegatorDetails> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegatorDetailsFromAddress(address)
  }

  public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
    return this.accountController.getNominatorDetails(address)
  }

  public async getDelegationDetailsFromPublicKey(publicKey: PublicKey, delegatees: string[]): Promise<DelegationDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegationDetailsFromAddress(address, delegatees)
  }

  public async getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails> {
    const [nominatorDetails, validatorsDetails] = await Promise.all([
      this.accountController.getNominatorDetails(address, delegatees),
      Promise.all(delegatees.map((validator) => this.accountController.getValidatorDetails(validator)))
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
  public async prepareDelegatorActionFromPublicKey(publicKey: PublicKey, type: any, data?: any): Promise<any[]> {
    if (!data) {
      data = {}
    }

    switch (type) {
      case PolkadotStakingActionType.BOND_NOMINATE:
        assertFields(`${type} action`, data, 'targets', 'value', 'payee')

        return this.prepareNomination(publicKey, data.tip || 0, data.targets, data.controller || publicKey, data.value, data.payee)
      case PolkadotStakingActionType.REBOND_NOMINATE:
        assertFields(`${type} action`, data, 'targets', 'value')

        return this.prepareRebondNominate(publicKey, data.tip || 0, data.targets, data.value)
      case PolkadotStakingActionType.NOMINATE:
        assertFields(`${type} action`, data, 'targets')

        return this.prepareNomination(publicKey, data.tip || 0, data.targets)
      case PolkadotStakingActionType.CANCEL_NOMINATION:
        return this.prepareScheduleUndelegate(publicKey, data.tip || 0, data.value)
      case PolkadotStakingActionType.CHANGE_NOMINATION:
        assertFields(`${type} action`, data, 'targets')

        return this.prepareChangeValidator(publicKey, data.tip || 0, data.targets)
      case PolkadotStakingActionType.UNBOND:
        assertFields(`${type} action`, data, 'value')

        return this.prepareUnbond(publicKey, data.tip || 0, data.value)
      case PolkadotStakingActionType.REBOND:
        assertFields(`${type} action`, data, 'value')

        return this.prepareRebond(publicKey, data.tip || 0, data.value)
      case PolkadotStakingActionType.BOND_EXTRA:
        assertFields(`${type} action`, data, 'value')

        return this.prepareBondExtra(publicKey, data.tip || 0, data.value)
      case PolkadotStakingActionType.REBOND_EXTRA:
        assertFields(`${type} action`, data, 'value')

        return this.prepareRebondExtra(publicKey, data.tip || 0, data.value)
      case PolkadotStakingActionType.WITHDRAW_UNBONDED:
        return this.prepareWithdrawUnbonded(publicKey, data.tip || 0)
      case PolkadotStakingActionType.CHANGE_REWARD_DESTINATION:
        return Promise.reject('Unsupported delegator action.')
      case PolkadotStakingActionType.CHANGE_CONTROLLER:
        return Promise.reject('Unsupported delegator action.')
      default:
        return Promise.reject('Unsupported delegator action.')
    }
  }

  public async prepareNomination(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    targets: string[] | string,
    controller?: string,
    value?: string | number | BigNumber,
    payee?: string | PolkadotPayee
  ): Promise<SubstrateUnsignedTransaction[]> {
    const balance = await this.accountController.getBalance(publicKey)
    const available = new BigNumber(balance.transferable).minus(value || 0)

    const bondFirst = controller !== undefined && value !== undefined && payee !== undefined

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, available, [
      ...(bondFirst
        ? [
            // tslint:disable-next-line: no-object-literal-type-assertion
            {
              type: 'bond',
              tip,
              args: {
                controller,
                value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!),
                payee: typeof payee === 'string' ? PolkadotPayee[payee as keyof typeof PolkadotPayee] : payee
              }
            } as SubstrateTransactionParameters<PolkadotProtocolConfiguration>
          ]
        : []),
      {
        type: 'nominate',
        tip,
        args: {
          targets: typeof targets === 'string' ? [targets] : targets
        }
      }
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareRebondNominate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    targets: string[] | string,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction[]> {
    const [balance, lockedBalance] = await Promise.all([
      this.accountController.getBalance(publicKey),
      this.accountController.getUnlockingBalance(publicKey)
    ])

    const toDelegate = BigNumber.isBigNumber(value) ? value : new BigNumber(value)

    const params: SubstrateTransactionParameters<PolkadotProtocolConfiguration>[] = []
    if (toDelegate.gt(lockedBalance)) {
      params.push(
        {
          type: 'rebond',
          tip,
          args: {
            value: lockedBalance
          }
        },
        {
          type: 'bond_extra',
          tip,
          args: {
            value: toDelegate.minus(lockedBalance)
          }
        }
      )
    } else {
      params.push({
        type: 'rebond',
        tip,
        args: {
          value: toDelegate
        }
      })
    }
    params.push({
      type: 'nominate',
      tip,
      args: {
        targets: typeof targets === 'string' ? [targets] : targets
      }
    })

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, params)

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareScheduleUndelegate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value?: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction[]> {
    const balance = await this.accountController.getBalance(publicKey)
    const keepController = value === undefined

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, [
      {
        type: 'cancel_nomination',
        tip,
        args: {}
      },
      ...(keepController
        ? []
        : [
            {
              type: 'unbond',
              tip,
              args: {
                value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!)
              }
            } as SubstrateTransactionParameters<PolkadotProtocolConfiguration>
          ])
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareChangeValidator(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    targets: string[] | string
  ): Promise<SubstrateUnsignedTransaction[]> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, [
      {
        type: 'nominate',
        tip,
        args: {
          targets: typeof targets === 'string' ? [targets] : targets
        }
      }
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareUnbond(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction[]> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, [
      {
        type: 'unbond',
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareRebond(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction[]> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, [
      {
        type: 'rebond',
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareBondExtra(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction[]> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, [
      {
        type: 'bond_extra',
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareRebondExtra(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction[]> {
    const [balance, lockedBalance] = await Promise.all([
      this.accountController.getBalance(publicKey),
      this.accountController.getUnlockingBalance(publicKey)
    ])

    const toDelegate = BigNumber.isBigNumber(value) ? value : new BigNumber(value)

    const configs: SubstrateTransactionParameters<PolkadotProtocolConfiguration>[] = toDelegate.gt(lockedBalance)
      ? [
          {
            type: 'rebond',
            tip,
            args: {
              value: lockedBalance
            }
          },
          {
            type: 'bond_extra',
            tip,
            args: {
              value: toDelegate.minus(lockedBalance)
            }
          }
        ]
      : [
          {
            type: 'rebond',
            tip,
            args: {
              value: toDelegate
            }
          }
        ]

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, configs)

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  public async prepareWithdrawUnbonded(publicKey: PublicKey, tip: string | number | BigNumber): Promise<SubstrateUnsignedTransaction[]> {
    const [balance, slashingSpansNumber] = await Promise.all([
      this.accountController.getBalance(publicKey),
      this.accountController.getSlashingSpansNumber(publicKey)
    ])

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferable, [
      {
        type: 'withdraw_unbonded',
        tip,
        args: { slashingSpansNumber }
      }
    ])

    return [newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })]
  }

  // Custom

  public async getNominatorDetails(address: string, validators?: string[]): Promise<PolkadotNominatorDetails> {
    return this.accountController.getNominatorDetails(address, validators)
  }

  public async getValidatorDetails(address: string): Promise<PolkadotValidatorDetails> {
    return this.accountController.getValidatorDetails(address)
  }

  public async getNominationStatus(address: string, validator: string, era?: number): Promise<PolkadotNominationStatus | undefined> {
    return this.accountController.getNominationStatus(address, validator, era)
  }

  public async getStakingBalance(address: string): Promise<PolkadotStakingBalance<Amount<_Units>> | undefined> {
    const stakingBalance: PolkadotStakingBalance | undefined = await this.accountController.getStakingBalance(address)
    if (stakingBalance === undefined) {
      return undefined
    }

    return {
      bonded: newAmount(stakingBalance.bonded, 'blockchain'),
      unlocking: newAmount(stakingBalance.unlocking, 'blockchain')
    }
  }

  public async getMinNominatorBond(): Promise<Amount<_Units>> {
    const minNominatorBond: BigNumber | undefined = await this.nodeClient.getMinNominatorBond()

    return newAmount(minNominatorBond ?? 0, 'blockchain')
  }

  public async getExistentialDeposit(): Promise<Amount<_Units>> {
    const existentialDeposit: BigNumber | undefined = await this.nodeClient.getExistentialDeposit()

    return newAmount(existentialDeposit ?? 0, 'blockchain')
  }

  public async getFutureStakingTransactionsFee(address: string): Promise<Amount<_Units>> {
    const futureTransactions = await this.getFutureRequiredTransactions(address, 'delegate')
    const feeEstimation: BigNumber = await this.transactionController.estimateTransactionFees(address, futureTransactions)

    return newAmount(feeEstimation, 'blockchain')
  }

  protected async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    intention: 'transfer' | 'check' | 'delegate'
  ): Promise<[SubstrateTransactionType<PolkadotProtocolConfiguration>, any][]> {
    const results = await Promise.all([
      this.accountController.isBonded(accountId),
      this.accountController.isDelegating(accountId),
      this.accountController.getBalance(accountId),
      this.accountController.getUnlockingBalance(accountId)
    ])

    const isBonded = results[0]
    const isNominating = results[1]
    const balance = results[2]
    const unlockingBalance = results[3]

    const transferableBalance = balance.transferable.minus(balance.existentialDeposit)
    const stakingBalance = balance.transferable

    const isUnbonding = unlockingBalance.gt(0)

    const requiredTransactions: [SubstrateTransactionType<PolkadotProtocolConfiguration>, any][] = []

    if (intention === 'transfer') {
      requiredTransactions.push([
        'transfer',
        {
          to: SubstrateSS58Address.createPlaceholder(),
          value: transferableBalance
        }
      ])
    }
    if (!isBonded && !isUnbonding && intention === 'delegate') {
      // not delegated & unbond
      requiredTransactions.push(
        [
          'bond',
          {
            // controller: SubstrateSS58Address.createPlaceholder(),
            value: stakingBalance,
            payee: 0
          }
        ],
        [
          'nominate',
          {
            targets: [SubstrateSS58Address.createPlaceholder()]
          }
        ],
        ['cancel_nomination', {}],
        [
          'unbond',
          {
            value: stakingBalance
          }
        ],
        [
          'withdraw_unbonded',
          {
            slashingSpansNumber: 0
          }
        ]
      )
    } else if (isUnbonding && intention === 'delegate') {
      requiredTransactions.push(
        [
          'rebond',
          {
            value: unlockingBalance
          }
        ],
        [
          'nominate',
          {
            targets: [SubstrateSS58Address.createPlaceholder()]
          }
        ],
        ['cancel_nomination', {}],
        [
          'unbond',
          {
            value: stakingBalance.plus(unlockingBalance)
          }
        ],
        [
          'withdraw_unbonded',
          {
            slashingSpansNumber: 0
          }
        ]
      )
    } else if (isBonded) {
      requiredTransactions.push(
        [
          'unbond',
          {
            value: stakingBalance
          }
        ],
        [
          'withdraw_unbonded',
          {
            slashingSpansNumber: 0
          }
        ]
      )
    }

    if (isNominating) {
      requiredTransactions.push(['cancel_nomination', {}])
    }

    return requiredTransactions
  }
}
