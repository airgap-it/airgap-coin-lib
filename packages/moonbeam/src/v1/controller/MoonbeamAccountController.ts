import { DelegatorAction, Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { OperationFailedError } from '@airgap/coinlib-core/errors'
import { flattenArray } from '@airgap/coinlib-core/utils/array'
import { SubstrateAccountId, SubstrateCommonAccountController, SubstrateEthAddress } from '@airgap/substrate/v1'

import { MoonbeamCollatorStatus } from '../data/staking/MoonbeamCandidateMetadata'
import { MoonbeamCollatorDetails } from '../data/staking/MoonbeamCollatorDetails'
import { MoonbeamDelegationDetails } from '../data/staking/MoonbeamDelegationDetails'
import {
  MoonbeamDelegationActionRaw,
  MoonbeamDelegationRequest,
  MoonbeamDelegationScheduledRequests
} from '../data/staking/MoonbeamDelegationScheduledRequests'
import { MoonbeamDelegator, MoonbeamDelegatorStatusLeaving, MoonbeamDelegatorStatusRaw } from '../data/staking/MoonbeamDelegator'
import { MoonbeamDelegatorDetails } from '../data/staking/MoonbeamDelegatorDetails'
import { MoonbeamStakingActionType } from '../data/staking/MoonbeamStakingActionType'
import { MoonbeamNodeClient } from '../node/MoonbeamNodeClient'
import { MoonbeamProtocolConfiguration } from '../types/configuration'

export class MoonbeamAccountController extends SubstrateCommonAccountController<MoonbeamProtocolConfiguration, MoonbeamNodeClient> {
  public async isDelegating(accountId: SubstrateAccountId<SubstrateEthAddress>): Promise<boolean> {
    const delegatorState = await this.nodeClient.getDelegatorState(SubstrateEthAddress.from(accountId))

    return delegatorState ? delegatorState.delegations.elements.length > 0 : false
  }

  public async getMinDelegationAmount(accountId: SubstrateAccountId<SubstrateEthAddress>): Promise<string> {
    const isDelegating = await this.isDelegating(accountId)
    const minAmount = isDelegating ? await this.nodeClient.getMinDelegation() : await this.nodeClient.getMinDelegatorStake()
    if (!minAmount) {
      throw new OperationFailedError(Domain.SUBSTRATE, 'Could not fetch network constants')
    }

    return minAmount.toFixed()
  }

  public async getCurrentCollators(accountId: SubstrateAccountId<SubstrateEthAddress>): Promise<string[]> {
    const delegatorState = await this.nodeClient.getDelegatorState(SubstrateEthAddress.from(accountId))
    if (delegatorState) {
      return delegatorState.delegations.elements.map((collatorDetails) => collatorDetails.owner.asAddress())
    }

    return []
  }

  public async getDelegatorDetails(accountId: SubstrateAccountId<SubstrateEthAddress>): Promise<MoonbeamDelegatorDetails> {
    const address = SubstrateEthAddress.from(accountId)
    const results = await Promise.all([this.getBalance(address), this.nodeClient.getDelegatorState(address)])

    const balance = results[0]
    const delegatorState = results[1]

    if (!balance) {
      return Promise.reject('Could not fetch delegator details.')
    }

    const totalBond = delegatorState?.total.value ?? new BigNumber(0)

    let status: MoonbeamDelegatorDetails['status']
    switch (delegatorState?.status.type.value) {
      case MoonbeamDelegatorStatusRaw.ACTIVE:
        status = 'Active'
        break
      case MoonbeamDelegatorStatusRaw.LEAVING:
        status = 'Leaving'
        break
    }

    return {
      address: address.asString(),
      balance: balance.total.toString(),
      totalBond: totalBond.toString(),
      delegatees: delegatorState?.delegations.elements.map((bond) => bond.owner.asAddress()) ?? [],
      availableActions: await this.getStakingActions(delegatorState),
      status
    }
  }

  public async getCollatorDetails(accountId: SubstrateAccountId<SubstrateEthAddress>): Promise<MoonbeamCollatorDetails> {
    const address = SubstrateEthAddress.from(accountId)

    const results = await Promise.all([this.nodeClient.getCandidateInfo(address), this.nodeClient.getCollatorCommission()])

    const candidateInfo = results[0]
    const commission = results[1]

    if (!candidateInfo || !commission) {
      return Promise.reject('Could not fetch collator details.')
    }

    let status: MoonbeamCollatorDetails['status']
    switch (candidateInfo.status.value) {
      case MoonbeamCollatorStatus.ACTIVE:
        status = 'Active'
        break
      case MoonbeamCollatorStatus.IDLE:
        status = 'Idle'
        break
      case MoonbeamCollatorStatus.LEAVING:
        status = 'Leaving'
    }

    return {
      address: address.asString(),
      status,
      minEligibleBalance: candidateInfo.lowestTopDelegationAmount.toString(),
      ownStakingBalance: candidateInfo.bond.toString(),
      totalStakingBalance: candidateInfo.totalCounted.toString(),
      commission: commission.dividedBy(1_000_000_000).toString(), // commission is Perbill (parts per billion)
      delegators: candidateInfo.delegationCount.toNumber()
    }
  }

  public async getDelegationDetails(
    accountId: SubstrateAccountId<SubstrateEthAddress>,
    collator: SubstrateAccountId<SubstrateEthAddress>
  ): Promise<MoonbeamDelegationDetails> {
    const delegatorAddress = SubstrateEthAddress.from(accountId)
    const collatorAddress = SubstrateEthAddress.from(collator)

    const results = await Promise.all([
      this.getBalance(delegatorAddress),
      this.nodeClient.getDelegatorState(delegatorAddress),
      this.getCollatorDetails(collator),
      this.nodeClient.getDelegationScheduledRequests(collatorAddress),
      this.nodeClient.getRound()
    ])

    const balance = results[0]
    const delegatorState = results[1]
    const collatorDetails = results[2]
    const delegationScheduledRequests = results[3]
    const currentRound = results[4]?.current

    if (!balance || !collatorDetails) {
      return Promise.reject('Could not fetch delegation details.')
    }

    const bond = delegatorState?.delegations.elements.find((bond) => bond.owner.compare(collator) === 0)?.amount.value ?? new BigNumber(0)
    const totalBond = delegatorState?.total.value ?? new BigNumber(0)

    let status: MoonbeamDelegatorDetails['status']
    switch (delegatorState?.status.type.value) {
      case MoonbeamDelegatorStatusRaw.ACTIVE:
        status = 'Active'
        break
      case MoonbeamDelegatorStatusRaw.LEAVING:
        status = currentRound?.gte((delegatorState.status as MoonbeamDelegatorStatusLeaving).roundIndex) ? 'ReadyToLeave' : 'Leaving'
        break
    }

    const delegatorDetails = {
      address: delegatorAddress.asString(),
      balance: balance.total.toString(),
      totalBond: totalBond.toString(),
      delegatees: delegatorState?.delegations.elements.map((bond) => bond.owner.asAddress()) ?? [],
      availableActions: await this.getStakingActions(delegatorState, collatorDetails, delegationScheduledRequests),
      status
    }

    const changeRequest = delegationScheduledRequests?.requests.elements.find(
      (request) => request.delegator.asAddress() === delegatorDetails.address
    )

    return {
      delegatorDetails,
      collatorDetails,
      bond: bond.toString(),
      pendingRequest: changeRequest
        ? {
            type: changeRequest.action.type.value === MoonbeamDelegationActionRaw.REVOKE ? 'revoke' : 'decrease',
            amount: changeRequest.action.amount.toString(),
            executableIn: currentRound
              ? BigNumber.max(changeRequest.whenExecutable.value.minus(currentRound.value), 0).toNumber()
              : undefined
          }
        : undefined
    }
  }

  private async getStakingActions(
    delegator?: MoonbeamDelegator,
    collator?: MoonbeamCollatorDetails,
    delegationScheduledRequests?: MoonbeamDelegationScheduledRequests
  ): Promise<DelegatorAction[]> {
    const actions: DelegatorAction[] = []

    const scheduledLeaving = delegator ? await this.getScheduledLeaving(delegator) : undefined

    const scheduledRequests = delegationScheduledRequests
      ? delegator && collator
        ? delegationScheduledRequests.requests.elements.filter((value) => value.delegator.asAddress() === delegator.id.asAddress())
        : []
      : undefined

    const delegations = delegator?.delegations.elements ?? []
    const maxDelegations = await this.nodeClient.getMaxDelegationsPerDelegator()

    const canDelegateToCollator =
      maxDelegations?.gt(delegations.length) && collator && !delegations.some((bond) => bond.owner.compare(collator.address) === 0)

    const isDelegatingCollator = !!collator && delegations.some((bond) => bond.owner.compare(collator.address) === 0)

    const currentRound = scheduledLeaving || scheduledRequests ? (await this.nodeClient.getRound())?.current.value : undefined

    if (canDelegateToCollator && !scheduledLeaving && scheduledRequests?.length === 0) {
      actions.push(...this.getUndelegatedActions())
    }

    if (delegations.length > 0 && !scheduledLeaving && scheduledRequests?.length === 0) {
      actions.push(...this.getDelegatedActions(isDelegatingCollator))
    }

    if (scheduledLeaving && currentRound) {
      actions.push(...(await this.getLeavingActions(currentRound, scheduledLeaving)))
    }

    if (scheduledRequests && scheduledRequests.length > 0 && currentRound) {
      actions.push(...(await this.getRequestActions(currentRound, scheduledRequests)))
    }

    return actions
  }

  private async getScheduledLeaving(delegator: MoonbeamDelegator): Promise<BigNumber | undefined> {
    if (delegator.status instanceof MoonbeamDelegatorStatusLeaving) {
      return delegator.status.roundIndex.value
    }

    const allDelegationScheduledRequests = await Promise.all(
      delegator.delegations.elements.map((bond) => {
        const collator = SubstrateEthAddress.from(bond.owner.address)
        return this.nodeClient.getDelegationScheduledRequests(collator)
      })
    )

    return allDelegationScheduledRequests.reduce<BigNumber | undefined>((acc, requests) => {
      if (acc === undefined) {
        return undefined
      }

      const whenExecutable = requests?.requests.elements.find((request) => {
        request.delegator.asAddress() === delegator.id.asAddress() && request.action.type.value === MoonbeamDelegationActionRaw.REVOKE
      })?.whenExecutable.value

      if (whenExecutable === undefined) {
        return undefined
      }

      if (acc.eq(whenExecutable) || acc.eq(-1)) {
        return whenExecutable
      } else {
        return undefined
      }
    }, new BigNumber(-1))
  }

  private getUndelegatedActions(): DelegatorAction[] {
    return [
      {
        type: MoonbeamStakingActionType.DELEGATE,
        args: ['candidate', 'amount']
      }
    ]
  }

  private getDelegatedActions(isDelegatingCollator: boolean): DelegatorAction[] {
    const actions: DelegatorAction[] = []

    actions.push({
      type: MoonbeamStakingActionType.SCHEDULE_UNDELEGATE_ALL
    })

    if (isDelegatingCollator) {
      actions.push(
        {
          type: MoonbeamStakingActionType.BOND_MORE,
          args: ['candidate', 'more']
        },
        {
          type: MoonbeamStakingActionType.SCHEDULE_BOND_LESS,
          args: ['candidate', 'less']
        },
        {
          type: MoonbeamStakingActionType.SCHEDULE_UNDELEGATE,
          args: ['collator']
        }
      )
    }

    return actions
  }

  private async getLeavingActions(currentRound: BigNumber, scheduledLeaving: BigNumber): Promise<DelegatorAction[]> {
    if (currentRound.gte(scheduledLeaving)) {
      return [
        {
          type: MoonbeamStakingActionType.EXECUTE_UNDELEGATE_ALL
        }
      ]
    } else {
      return [
        {
          type: MoonbeamStakingActionType.CANCEL_UNDELEGATE_ALL
        }
      ]
    }
  }

  private async getRequestActions(currentRound: BigNumber, scheduledRequests: MoonbeamDelegationRequest[]): Promise<DelegatorAction[]> {
    const actions = await Promise.all(
      scheduledRequests.map((request) => {
        if (request.action.type.value === MoonbeamDelegationActionRaw.REVOKE) {
          return this.getRevokeRequestActions(currentRound, request)
        }

        if (request.action.type.value === MoonbeamDelegationActionRaw.DECREASE) {
          return this.getDecreaseRequestActions(currentRound, request)
        }

        return []
      })
    )

    return flattenArray(actions)
  }

  private async getRevokeRequestActions(currentRound: BigNumber, scheduledRequest: MoonbeamDelegationRequest): Promise<DelegatorAction[]> {
    if (currentRound.gte(scheduledRequest.whenExecutable.value)) {
      return [
        {
          type: MoonbeamStakingActionType.EXECUTE_UNDELEGATE,
          args: ['candidate']
        }
      ]
    } else {
      return [
        {
          type: MoonbeamStakingActionType.CANCEL_UNDELEGATE,
          args: ['candidate']
        }
      ]
    }
  }

  private async getDecreaseRequestActions(
    currentRound: BigNumber,
    scheduledRequest: MoonbeamDelegationRequest
  ): Promise<DelegatorAction[]> {
    if (currentRound.gte(scheduledRequest.whenExecutable.value)) {
      return [
        {
          type: MoonbeamStakingActionType.EXECUTE_BOND_LESS,
          args: ['candidate']
        }
      ]
    } else {
      return [
        {
          type: MoonbeamStakingActionType.CANCEL_BOND_LESS
        }
      ]
    }
  }
}
