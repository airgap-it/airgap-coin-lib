import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { newUnsignedTransaction, PublicKey } from '@airgap/module-kit'
import {
  SubscanBlockExplorerClient,
  SubstrateAccountId,
  SubstrateProtocol,
  SubstrateProtocolImpl,
  SubstrateSS58Address,
  SubstrateTransactionParameters,
  SubstrateTransactionType,
  SubstrateUnsignedTransaction
} from '@airgap/substrate/v1'
import { PolkadotAccountController } from '../controller/PolkadotAccountController'
import { PolkadotTransactionController } from '../controller/PolkadotTransactionController'
import { SubstratePayee } from '../data/staking/SubstratePayee'
import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { PolkadotProtocolConfiguration } from '../types/configuration'
import { PolkadotBaseProtocolOptions, PolkadotProtocolNetwork } from '../types/protocol'

// Interface

export interface PolkadotBaseProtocol<_Units extends string = string> extends SubstrateProtocol<_Units, PolkadotProtocolNetwork> {}

// Implementation

export abstract class PolkadotBaseProtocolImpl<_Units extends string>
  extends SubstrateProtocolImpl<
    _Units,
    PolkadotProtocolConfiguration,
    PolkadotProtocolNetwork,
    PolkadotNodeClient,
    PolkadotAccountController,
    PolkadotTransactionController
  >
  implements PolkadotBaseProtocol<_Units>
{
  public constructor(options: PolkadotBaseProtocolOptions<_Units>) {
    const nodeClient: PolkadotNodeClient = new PolkadotNodeClient(options.configuration, options.network.rpcUrl)

    const accountController: PolkadotAccountController = new PolkadotAccountController(options.configuration, nodeClient)
    const transactionController: PolkadotTransactionController = new PolkadotTransactionController(options.configuration, nodeClient)

    const blockExplorer: SubscanBlockExplorerClient = new SubscanBlockExplorerClient(options.network.blockExplorerApi)

    super(options, nodeClient, accountController, transactionController, blockExplorer)
  }

  public async prepareNomination(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    targets: string[] | string,
    controller?: string,
    value?: string | number | BigNumber,
    payee?: string | SubstratePayee
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)
    const available = new BigNumber(balance.transferableCoveringFees).minus(value || 0)

    const bondFirst = controller !== undefined && value !== undefined && payee !== undefined

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, available, [
      ...(bondFirst
        ? [
            {
              type: 'bond',
              tip,
              args: {
                controller,
                value: BigNumber.isBigNumber(value) ? value : new BigNumber(value!),
                payee: typeof payee === 'string' ? SubstratePayee[payee] : payee
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

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareRebondNominate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    targets: string[] | string,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
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

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, params)

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareScheduleUndelegate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value?: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)
    const keepController = value === undefined

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, [
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

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareChangeValidator(
    publicKey: string,
    tip: string | number | BigNumber,
    targets: string[] | string
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, [
      {
        type: 'nominate',
        tip,
        args: {
          targets: typeof targets === 'string' ? [targets] : targets
        }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareUnbond(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, [
      {
        type: 'unbond',
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareRebond(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, [
      {
        type: 'rebond',
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareBondExtra(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.accountController.getBalance(publicKey)

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, [
      {
        type: 'bond_extra',
        tip,
        args: {
          value: BigNumber.isBigNumber(value) ? value : new BigNumber(value)
        }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareRebondExtra(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    value: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
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

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, configs)

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareWithdrawUnbonded(publicKey: string, tip: string | number | BigNumber): Promise<SubstrateUnsignedTransaction> {
    const [balance, slashingSpansNumber] = await Promise.all([
      this.accountController.getBalance(publicKey),
      this.accountController.getSlashingSpansNumber(publicKey)
    ])

    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, balance.transferableCoveringFees, [
      {
        type: 'withdraw_unbonded',
        tip,
        args: { slashingSpansNumber }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
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
    const stakingBalance = balance.transferableCoveringFees

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
            controller: SubstrateSS58Address.createPlaceholder(),
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
