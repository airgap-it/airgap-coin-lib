import { Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { newAmount, newUnsignedTransaction, PublicKey } from '@airgap/module-kit'
import {
  SubscanBlockExplorerClient,
  SubstrateAccountId,
  SubstrateEthAddress,
  SubstrateProtocol,
  SubstrateProtocolImpl,
  SubstrateTransactionType,
  SubstrateUnsignedTransaction
} from '@airgap/substrate/v1'

import { MoonbeamAccountController } from '../controller/MoonbeamAccountController'
import { MoonbeamTransactionController } from '../controller/MoonbeamTransactionController'
import { MoonbeamNodeClient } from '../node/MoonbeamNodeClient'
import { MoonbeamProtocolConfiguration } from '../types/configuration'
import { MoonbeamBaseProtocolOptions, MoonbeamProtocolNetwork } from '../types/protocol'

// Interface

export interface MoonbeamBaseProtocol<_Units extends string = string> extends SubstrateProtocol<_Units, MoonbeamProtocolNetwork> {}

// Implementation

export abstract class MoonbeamBaseProtocolImpl<_Units extends string>
  extends SubstrateProtocolImpl<
    _Units,
    MoonbeamProtocolConfiguration,
    MoonbeamProtocolNetwork,
    MoonbeamNodeClient,
    MoonbeamAccountController,
    MoonbeamTransactionController
  >
  implements MoonbeamBaseProtocol<_Units> {
  public constructor(options: MoonbeamBaseProtocolOptions<_Units>) {
    const nodeClient: MoonbeamNodeClient = new MoonbeamNodeClient(options.configuration, options.network.rpcUrl)

    const accountController: MoonbeamAccountController = new MoonbeamAccountController(options.configuration, nodeClient)
    const transactionController: MoonbeamTransactionController = new MoonbeamTransactionController(options.configuration, nodeClient)

    const blockExplorer: SubscanBlockExplorerClient = new SubscanBlockExplorerClient(options.network.blockExplorerApi)

    super(options, nodeClient, accountController, transactionController, blockExplorer)
  }

  public async prepareDelegation(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string,
    amount: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const requestedAmount = new BigNumber(amount)
    const minAmount = await this.accountController.getMinDelegationAmount(publicKey)
    if (requestedAmount.lt(minAmount)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, `The amount is too low, it has to be at least ${minAmount.toString()}`)
    }

    const results = await Promise.all([
      this.accountController.getDelegatorDetails(publicKey),
      this.accountController.getCollatorDetails(candidate),
      this.nodeClient.getMaxDelegationsPerDelegator(),
      this.getBalanceOfPublicKey(publicKey)
    ])

    const delegatorDetails = results[0]
    const collatorDetails = results[1]
    const maxDelegations = results[2]
    const balance = results[3]

    if (maxDelegations?.lte(delegatorDetails.delegatees.length)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'This delegator cannot nominate more collators.')
    }

    const available = new BigNumber(newAmount(balance.total).blockchain(this.metadata.units).value).minus(amount)
    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, available, [
      {
        type: 'delegate',
        tip,
        args: {
          candidate,
          amount: new BigNumber(amount),
          candidateDelegationCount: collatorDetails.delegators,
          delegationCount: delegatorDetails.delegatees.length
        }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareScheduleUndelegate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    collator: string
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'schedule_revoke_delegation',
          tip,
          args: {
            collator
          }
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareExecuteUndelegate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<SubstrateUnsignedTransaction> {
    return this.prepareExecuteDelegationRequest(publicKey, tip, candidate)
  }

  public async prepareCancelUndelegate(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<SubstrateUnsignedTransaction> {
    return this.prepareCancelDelegationRequest(publicKey, tip, candidate)
  }

  public async prepareScheduleUndelegateAll(publicKey: PublicKey, tip: string | number | BigNumber): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'schedule_leave_delegators',
          tip,
          args: {}
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareExecuteUndelegateAll(publicKey: PublicKey, tip: string | number | BigNumber): Promise<SubstrateUnsignedTransaction> {
    const results = await Promise.all([
      this.accountController.getDelegatorDetails(publicKey),
      this.getBalanceOfPublicKey(publicKey),
      this.getAddressFromPublicKey(publicKey)
    ])

    const delegatorDetails = results[0]
    const balance = results[1]
    const delegator = results[2]

    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'execute_leave_delegators',
          tip,
          args: {
            delegator,
            delegationCount: delegatorDetails.delegatees.length
          }
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareCancelUndelegateAll(publicKey: PublicKey, tip: string | number | BigNumber): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'cancel_leave_delegators',
          tip,
          args: {}
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareDelegatorBondMore(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string,
    more: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const available = new BigNumber(newAmount(balance.total).blockchain(this.metadata.units).value).minus(more)
    const encoded = await this.transactionController.prepareSubmittableTransactions(publicKey, available, [
      {
        type: 'delegator_bond_more',
        tip,
        args: {
          candidate,
          more: new BigNumber(more)
        }
      }
    ])

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareScheduleDelegatorBondLess(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string,
    less: string | number | BigNumber
  ): Promise<SubstrateUnsignedTransaction> {
    const [balance, delegationDetails] = await Promise.all([
      this.getBalanceOfPublicKey(publicKey),
      this.accountController.getDelegationDetails(publicKey, candidate)
    ])
    const bondAmount = new BigNumber(delegationDetails.bond)
    const requestedAmount = new BigNumber(less)
    if (requestedAmount.gt(bondAmount)) {
      throw new ConditionViolationError(Domain.SUBSTRATE, 'Bond less amount too high')
    } else if (requestedAmount.eq(bondAmount)) {
      return this.prepareScheduleUndelegate(publicKey, tip, candidate)
    }

    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'schedule_delegator_bond_less',
          tip,
          args: {
            candidate,
            less: requestedAmount
          }
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  public async prepareExecuteDelegatorBondLess(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<SubstrateUnsignedTransaction> {
    return this.prepareExecuteDelegationRequest(publicKey, tip, candidate)
  }

  public async prepareCancelDelegatorBondLess(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<SubstrateUnsignedTransaction> {
    return this.prepareCancelDelegationRequest(publicKey, tip, candidate)
  }

  private async prepareExecuteDelegationRequest(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<SubstrateUnsignedTransaction> {
    const results = await Promise.all([this.getBalanceOfPublicKey(publicKey), this.getAddressFromPublicKey(publicKey)])

    const balance = results[0]
    const delegator = results[1]

    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'execute_delegation_request',
          tip,
          args: {
            delegator,
            candidate
          }
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  private async prepareCancelDelegationRequest(
    publicKey: PublicKey,
    tip: string | number | BigNumber,
    candidate: string
  ): Promise<SubstrateUnsignedTransaction> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const encoded = await this.transactionController.prepareSubmittableTransactions(
      publicKey,
      newAmount(balance.total).blockchain(this.metadata.units).value,
      [
        {
          type: 'cancel_delegation_request',
          tip,
          args: {
            candidate
          }
        }
      ]
    )

    return newUnsignedTransaction<SubstrateUnsignedTransaction>({ encoded })
  }

  protected async getFutureRequiredTransactions(
    accountId: SubstrateAccountId<SubstrateEthAddress>,
    intention: 'transfer' | 'check' | 'delegate'
  ): Promise<[SubstrateTransactionType<MoonbeamProtocolConfiguration>, any][]> {
    const results = await Promise.all([this.accountController.isDelegating(accountId), this.accountController.getBalance(accountId)])

    const isDelegating = results[0]
    const balance = results[1]

    const transferableBalance = balance.transferable.minus(balance.existentialDeposit)
    const stakingBalance = balance.transferableCoveringFees

    const requiredTransactions: [SubstrateTransactionType<MoonbeamProtocolConfiguration>, any][] = []

    if (intention === 'transfer') {
      requiredTransactions.push([
        'transfer',
        {
          to: SubstrateEthAddress.createPlaceholder(),
          value: transferableBalance
        }
      ])
    }
    if (!isDelegating && intention === 'delegate') {
      // not delegated
      requiredTransactions.push(
        [
          'delegate',
          {
            candidate: SubstrateEthAddress.createPlaceholder(),
            amount: stakingBalance,
            candidateDelegationCount: 0,
            delegationCount: 0
          }
        ],
        [
          'schedule_revoke_delegation',
          {
            collator: SubstrateEthAddress.createPlaceholder()
          }
        ],
        [
          'execute_delegation_request',
          {
            delegator: SubstrateEthAddress.createPlaceholder(),
            candidate: SubstrateEthAddress.createPlaceholder()
          }
        ]
      )
    }

    if (isDelegating && intention === 'delegate') {
      requiredTransactions.push(
        [
          'schedule_revoke_delegation',
          {
            collator: SubstrateEthAddress.createPlaceholder()
          }
        ],
        [
          'execute_delegation_request',
          {
            delegator: SubstrateEthAddress.createPlaceholder(),
            candidate: SubstrateEthAddress.createPlaceholder()
          }
        ]
      )
    }

    return requiredTransactions
  }
}
