import { KeyPair } from '../../../../data/KeyPair'
import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '../../../../dependencies/src/bip39-2.5.0/index'
import * as bitcoinJS from '../../../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { OperationFailedError } from '../../../../errors'
import { Domain } from '../../../../errors/coinlib-error'
import { flattenArray } from '../../../../utils/array'
import { DelegatorAction } from '../../../ICoinDelegateProtocol'
import { SubstrateAccountController } from '../../common/SubstrateAccountController'
import { SubstrateAccountId } from '../../compat/SubstrateCompatAddress'
import { SubstrateNetwork } from '../../SubstrateNetwork'
import { MoonbeamAddress } from '../data/account/MoonbeamAddress'
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

export class MoonbeamAccountController extends SubstrateAccountController<SubstrateNetwork.MOONBEAM, MoonbeamNodeClient> {
  public async createKeyPairFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<KeyPair> {
    const secret = mnemonicToSeed(mnemonic || '', password)

    return this.createKeyPairFromHexSecret(Buffer.from(secret).toString('hex'), derivationPath)
  }

  public async createKeyPairFromHexSecret(secret: string, derivationPath: string): Promise<KeyPair> {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, bitcoinJS.networks.bitcoin)
    const hdNode = ethereumNode.derivePath(derivationPath)

    return {
      privateKey: hdNode.keyPair.d.toBuffer(32),
      publicKey: hdNode.neutered().getPublicKeyBuffer().toString('hex')
    }
  }

  public async createAddressFromPublicKey(publicKey: string): Promise<MoonbeamAddress> {
    return MoonbeamAddress.from(publicKey)
  }

  public async isDelegating(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<boolean> {
    const delegatorState = await this.nodeClient.getDelegatorState(MoonbeamAddress.from(accountId))

    return delegatorState ? delegatorState.delegations.elements.length > 0 : false
  }

  public async getMinDelegationAmount(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<string> {
    const isDelegating = await this.isDelegating(accountId)
    const minAmount = isDelegating ? await this.nodeClient.getMinDelegation() : await this.nodeClient.getMinDelegatorStake()
    if (!minAmount) {
      throw new OperationFailedError(Domain.SUBSTRATE, 'Could not fetch network constants')
    }

    return minAmount.toFixed()
  }

  public async getCurrentCollators(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<string[]> {
    const delegatorState = await this.nodeClient.getDelegatorState(MoonbeamAddress.from(accountId))
    if (delegatorState) {
      return delegatorState.delegations.elements.map((collatorDetails) => collatorDetails.owner.asAddress())
    }

    return []
  }

  public async getDelegatorDetails(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<MoonbeamDelegatorDetails> {
    const address = MoonbeamAddress.from(accountId)
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
      address: address.getValue(),
      balance: balance.toString(),
      totalBond: totalBond.toString(),
      delegatees: delegatorState?.delegations.elements.map((bond) => bond.owner.asAddress()) ?? [],
      availableActions: await this.getStakingActions(delegatorState),
      status
    }
  }

  public async getCollatorDetails(accountId: SubstrateAccountId<MoonbeamAddress>): Promise<MoonbeamCollatorDetails> {
    const address = MoonbeamAddress.from(accountId)

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
      address: address.getValue(),
      status,
      minEligibleBalance: candidateInfo.lowestTopDelegationAmount.toString(),
      ownStakingBalance: candidateInfo.bond.toString(),
      totalStakingBalance: candidateInfo.totalCounted.toString(),
      commission: commission.dividedBy(1_000_000_000).toString(), // commission is Perbill (parts per billion)
      delegators: candidateInfo.delegationCount.toNumber()
    }
  }

  public async getDelegationDetails(
    accountId: SubstrateAccountId<MoonbeamAddress>,
    collator: SubstrateAccountId<MoonbeamAddress>
  ): Promise<MoonbeamDelegationDetails> {
    const delegatorAddress = MoonbeamAddress.from(accountId)
    const collatorAddress = MoonbeamAddress.from(collator)

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
      address: delegatorAddress.getValue(),
      balance: balance.toString(),
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
        const collator = MoonbeamAddress.from(bond.owner.address)
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
