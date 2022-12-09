import { DelegatorAction } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { SCALEAccountId, SubstrateAccountId, SubstrateCommonAccountController, SubstrateSS58Address } from '@airgap/substrate/v1'
import { SubstrateIdentityInfo } from '@airgap/substrate/v1/data/account/SubstrateRegistration'
import { SubstrateActiveEraInfo } from '../data/staking/SubstrateActiveEraInfo'
import { SubstrateElectionStatus } from '../data/staking/SubstrateEraElectionStatus'
import { SubstrateExposure } from '../data/staking/SubstrateExposure'
import { SubstrateNominations } from '../data/staking/SubstrateNominations'
import { SubstrateNominationStatus } from '../data/staking/SubstrateNominationStatus'
import {
  SubstrateLockedDetails,
  SubstrateNominatorDetails,
  SubstrateNominatorRewardDetails,
  SubstrateStakingDetails,
  SubstrateStakingStatus
} from '../data/staking/SubstrateNominatorDetails'
import { SubstrateStakingActionType } from '../data/staking/SubstrateStakingActionType'
import { SubstrateStakingLedger } from '../data/staking/SubstrateStakingLedger'
import {
  SubstrateValidatorDetails,
  SubstrateValidatorRewardDetails,
  SubstrateValidatorStatus
} from '../data/staking/SubstrateValidatorDetails'
import { SubstrateValidatorPrefs } from '../data/staking/SubstrateValidatorPrefs'
import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { PolkadotProtocolConfiguration } from '../types/configuration'

export class PolkadotAccountController extends SubstrateCommonAccountController<PolkadotProtocolConfiguration, PolkadotNodeClient> {
  public async getUnlockingBalance(accountId: SubstrateAccountId<SubstrateSS58Address>): Promise<BigNumber> {
    const stakingDetails = await this.nodeClient.getStakingLedger(this.substrateAddressFrom(accountId))

    return (
      stakingDetails?.unlocking.elements.map((entry) => entry.first.value).reduce((sum, next) => sum.plus(next), new BigNumber(0)) ??
      new BigNumber(0)
    )
  }

  public async isBonded(accountId: SubstrateAccountId<SubstrateSS58Address>): Promise<boolean> {
    const bonded = await this.nodeClient.getBonded(this.substrateAddressFrom(accountId))

    return bonded != undefined
  }

  public async isDelegating(accountId: SubstrateAccountId<SubstrateSS58Address>): Promise<boolean> {
    const nominations = await this.nodeClient.getNominations(this.substrateAddressFrom(accountId))

    return nominations != undefined
  }

  public async getCurrentValidators(accountId: SubstrateAccountId<SubstrateSS58Address>): Promise<string[]> {
    const nominations = await this.nodeClient.getNominations(this.substrateAddressFrom(accountId))
    if (nominations) {
      return nominations.targets.elements.map((target) => target.asAddress())
    }

    return []
  }

  public async getValidatorDetails(accountId: SubstrateAccountId<SubstrateSS58Address>): Promise<SubstrateValidatorDetails> {
    const address = this.substrateAddressFrom(accountId)
    const activeEra = await this.nodeClient.getActiveEraInfo()

    let identity: SubstrateIdentityInfo | undefined
    let status: SubstrateValidatorStatus | undefined
    let exposure: SubstrateExposure | undefined
    let validatorPrefs: SubstrateValidatorPrefs | undefined
    let lastEraReward: SubstrateValidatorRewardDetails | undefined
    if (activeEra) {
      const activeEraIndex = activeEra.index.toNumber()
      const results = await Promise.all([
        this.getAccountIdentityInfo(address),
        this.nodeClient.getValidators(),
        this.nodeClient.getValidatorPrefs(activeEraIndex, address),
        this.nodeClient.getValidatorExposure(activeEraIndex, address)
      ])

      identity = results[0]
      const currentValidators = results[1]
      validatorPrefs = results[2]
      exposure = results[3]

      lastEraReward = await this.getEraValidatorReward(address, activeEraIndex - 1)

      if (currentValidators && currentValidators.find((current: SubstrateSS58Address) => current.compare(address) == 0)) {
        status = 'Active'
      } else if (currentValidators) {
        status = 'Inactive'
      }
    }

    return {
      address: address.asString(),
      name: identity ? identity.display.toString() : undefined,
      status,
      ownStash: exposure ? exposure.own.toString() : undefined,
      totalStakingBalance: exposure ? exposure.total.toString() : undefined,
      commission: validatorPrefs
        ? validatorPrefs.commission.value.dividedBy(1_000_000_000).toString() // commission is Perbill (parts per billion)
        : undefined,
      lastEraReward,
      nominators: exposure?.others.elements.length ?? 0
    }
  }

  public async getNominatorDetails(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    validatorIds?: SubstrateAccountId<SubstrateSS58Address>[]
  ): Promise<SubstrateNominatorDetails> {
    const address = this.substrateAddressFrom(accountId)

    const results = await Promise.all([
      this.getBalance(address),
      this.nodeClient.getStakingLedger(address),
      this.nodeClient.getNominations(address),
      this.nodeClient.getActiveEraInfo(),
      this.nodeClient.getExpectedEraDuration(),
      this.nodeClient.getExistentialDeposit()
    ])

    const balance = results[0]
    const stakingLedger = results[1]
    const nominations = results[2]
    const activeEra = results[3]
    const expectedEraDuration = results[4]

    if (!balance || !activeEra || !expectedEraDuration) {
      return Promise.reject('Could not fetch nominator details.')
    }

    const validators = nominations?.targets?.elements?.map((target) => target.asAddress()) || []

    const stakingDetails = await this.getStakingDetails(accountId, stakingLedger, nominations, activeEra, expectedEraDuration)
    const availableActions = await this.getAvailableStakingActions(
      stakingDetails,
      nominations,
      validatorIds ?? validators,
      balance.transferableCoveringFees
    )

    return {
      address: address.asString(),
      balance: balance.toString(),
      delegatees: validators,
      availableActions,
      stakingDetails
    }
  }

  public async getNominationStatus(
    nominator: SubstrateAccountId<SubstrateSS58Address>,
    validator: SubstrateAccountId<SubstrateSS58Address>,
    era?: number
  ): Promise<SubstrateNominationStatus | undefined> {
    const eraIndex: number | undefined = era !== undefined ? era : (await this.nodeClient.getActiveEraInfo())?.index.toNumber()

    if (eraIndex === undefined) {
      return Promise.reject('Could not fetch active era')
    }

    const nominations = await this.nodeClient.getNominations(this.substrateAddressFrom(nominator))
    if (
      nominations === undefined ||
      !nominations.targets.elements.some((target: SCALEAccountId<PolkadotProtocolConfiguration>) => target.asAddress() === validator)
    ) {
      return undefined
    }

    const exposure: SubstrateExposure | undefined = await this.nodeClient.getValidatorExposure(
      eraIndex,
      this.substrateAddressFrom(validator)
    )

    if (!exposure) {
      return SubstrateNominationStatus.INACTIVE
    }

    const isActive: boolean = exposure.others.elements.some((element) => element.first.asAddress() === nominator.toString())
    if (!isActive) {
      return SubstrateNominationStatus.INACTIVE
    }

    const isOversubscribed: boolean = exposure.others.elements.length > 256
    if (isOversubscribed) {
      const position: number = exposure.others.elements
        .sort((a, b) => b.second.value.minus(a.second.value).toNumber())
        .map((exposure) => exposure.first.asAddress())
        .indexOf(nominator.toString())

      if (position > 256) {
        return SubstrateNominationStatus.OVERSUBSCRIBED
      }
    }

    return SubstrateNominationStatus.ACTIVE
  }

  public async getSlashingSpansNumber(accountId: SubstrateAccountId<SubstrateSS58Address>): Promise<number> {
    const slashingSpans = await this.nodeClient.getSlashingSpan(this.substrateAddressFrom(accountId))

    return slashingSpans ? slashingSpans.prior.elements.length + 1 : 0
  }

  private async getStakingDetails(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    stakingLedger: SubstrateStakingLedger | undefined,
    nominations: SubstrateNominations | undefined,
    activeEra: SubstrateActiveEraInfo,
    expectedEraDuration: BigNumber
  ): Promise<SubstrateStakingDetails | undefined> {
    if (!stakingLedger) {
      return undefined
    }

    const unlockingDetails = this.getUnlockingDetails(
      stakingLedger.unlocking.elements.map((tuple) => [tuple.first.value, tuple.second.value] as [BigNumber, BigNumber]),
      activeEra,
      expectedEraDuration
    )

    const results = await Promise.all([
      this.getStakingStatus(accountId, nominations, activeEra.index.toNumber()),
      nominations
        ? this.getNominatorRewards(
            accountId,
            nominations.targets.elements.map((id) => id.address),
            activeEra,
            5
          )
        : []
    ])

    const stakingStatus = results[0]
    const rewards = results[1]

    return {
      total: stakingLedger.total.toString(),
      active: stakingLedger.active.toString(),
      locked: unlockingDetails.locked,
      unlocked: unlockingDetails.unlocked,
      status: stakingStatus,
      nextEra: activeEra.start.value?.plus(expectedEraDuration)?.toNumber() || 0,
      rewards
    }
  }

  private getUnlockingDetails(
    unlocking: [BigNumber, BigNumber][],
    activeEra: SubstrateActiveEraInfo,
    expectedEraDuration: BigNumber
  ): { locked: SubstrateLockedDetails[]; unlocked: string } {
    const [locked, unlocked] = this.partitionArray(unlocking, ([_, era]) => activeEra.index.lt(era))

    const lockedDetails = locked.map(([value, era]: [BigNumber, BigNumber]) => {
      const eraStart = activeEra.start.value?.value || new BigNumber(0)
      const estimatedDuration = era.minus(activeEra.index.value).multipliedBy(expectedEraDuration)
      const expectedUnlock = eraStart.plus(estimatedDuration)

      return {
        value: value.toString(10),
        expectedUnlock: expectedUnlock.toNumber()
      }
    })

    const totalUnlocked = unlocked.reduce((total: BigNumber, [value, _]: [BigNumber, BigNumber]) => total.plus(value), new BigNumber(0))

    return {
      locked: lockedDetails,
      unlocked: totalUnlocked.toString()
    }
  }

  private async getStakingStatus(
    nominator: SubstrateAccountId<SubstrateSS58Address>,
    nominations: SubstrateNominations | undefined,
    eraIndex: number
  ): Promise<SubstrateStakingStatus> {
    const isWaitingForNomination: boolean = nominations?.submittedIn.gte(eraIndex) ?? false

    let hasActiveNominations: boolean = false
    if (!isWaitingForNomination && nominations) {
      hasActiveNominations = (
        await Promise.all(
          nominations.targets.elements.map((target: SCALEAccountId<PolkadotProtocolConfiguration>) =>
            this.getNominationStatus(nominator, target.asAddress(), eraIndex)
          )
        )
      ).some((status: SubstrateNominationStatus | undefined) => status === SubstrateNominationStatus.ACTIVE)
    }

    if (nominations === undefined) {
      return 'bonded'
    } else if (hasActiveNominations) {
      return 'nominating'
    } else if (!isWaitingForNomination && !hasActiveNominations) {
      return 'nominating_inactive'
    } else {
      return 'nominating_waiting'
    }
  }

  private async getEraValidatorReward(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    eraIndex: number
  ): Promise<SubstrateValidatorRewardDetails | undefined> {
    const address = this.substrateAddressFrom(accountId)

    const results = await Promise.all([
      this.nodeClient.getValidatorReward(eraIndex).then(async (result) => {
        return result ? result : this.nodeClient.getValidatorReward(eraIndex - 1)
      }),
      this.nodeClient.getRewardPoints(eraIndex),
      this.nodeClient.getStakersClipped(eraIndex, address),
      this.nodeClient.getValidatorPrefs(eraIndex, address)
    ])

    if (results.some((result) => !result)) {
      return undefined
    }

    const eraReward = results[0]
    const eraPoints = results[1]
    const exposureClipped = results[2]
    const validatorPrefs = results[3]

    const validatorPoints = eraPoints?.individual?.elements?.find((element) => element.first.address.compare(address))?.second?.value

    if (!eraReward || !eraPoints || !exposureClipped || !validatorPrefs || !validatorPoints) {
      return undefined
    }

    const validatorReward = this.calculateValidatorReward(eraReward, eraPoints.total.value, validatorPoints)

    return {
      amount: validatorReward.toFixed(),
      totalStake: exposureClipped.total.toString(),
      ownStake: exposureClipped.own.toString(),
      commission: validatorPrefs.commission.toString()
    }
  }

  private async getNominatorRewards(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    validators: SubstrateAccountId<SubstrateSS58Address>[],
    activeEra: SubstrateActiveEraInfo,
    eras: number | number[]
  ): Promise<SubstrateNominatorRewardDetails[]> {
    const address = this.substrateAddressFrom(accountId)
    const expectedEraDuration = await this.nodeClient.getExpectedEraDuration()

    if (!expectedEraDuration) {
      return Promise.reject('Could not fetch all necessary data.')
    }

    const eraIndices = Array.isArray(eras) ? eras : Array.from(Array(eras).keys()).map((index) => activeEra.index.toNumber() - 1 - index)

    const rewards = await Promise.all(
      eraIndices.map((era) =>
        this.calculateEraNominatorReward(
          address,
          validators.map((validator) => this.substrateAddressFrom(validator)),
          era
        ).then((partial) => {
          if (partial) {
            const rewardEra = partial.eraIndex || activeEra.index.toNumber()
            const erasPassed = activeEra.index.minus(rewardEra).toNumber()

            partial.timestamp = activeEra.start.value
              ? activeEra.start.value.minus(expectedEraDuration.multipliedBy(erasPassed - 1)).toNumber()
              : 0
          }

          return partial as SubstrateNominatorRewardDetails
        })
      )
    )

    return rewards.filter((reward) => reward)
  }

  private async calculateEraNominatorReward(
    accountId: SubstrateAccountId<SubstrateSS58Address>,
    validators: SubstrateAccountId<SubstrateSS58Address>[],
    eraIndex: number
  ): Promise<Partial<SubstrateNominatorRewardDetails> | undefined> {
    const results = await Promise.all([
      this.nodeClient.getValidatorReward(eraIndex),
      this.nodeClient.getRewardPoints(eraIndex),
      Promise.all(
        validators.map(
          async (validator) =>
            [
              this.substrateAddressFrom(validator),
              await this.nodeClient
                .getValidatorPrefs(eraIndex, this.substrateAddressFrom(validator))
                .then((prefs) => prefs?.commission?.value),
              await this.nodeClient.getStakersClipped(eraIndex, this.substrateAddressFrom(validator))
            ] as [SubstrateSS58Address, BigNumber | undefined, SubstrateExposure | undefined]
        )
      )
    ])

    const reward = results[0]
    const rewardPoints = results[1]
    const exposuresWithValidators = results[2]

    if (!reward || !rewardPoints || !exposuresWithValidators) {
      return undefined
    }

    const partialRewards = exposuresWithValidators
      .map(([validator, commission, exposure]) => {
        const validatorPoints = rewardPoints.individual.elements.find((element) => element.first.compare(validator) === 0)?.second?.value

        const nominatorStake = exposure?.others.elements.find((element) => element.first.compare(accountId) === 0)?.second?.value

        if (commission && exposure && validatorPoints && nominatorStake) {
          const validatorReward = this.calculateValidatorReward(reward, rewardPoints.total.value, validatorPoints)

          return this.calculateNominatorReward(validatorReward, commission, exposure.total.value, nominatorStake)
        } else {
          return undefined
        }
      })
      .filter((reward) => reward !== undefined)

    if (partialRewards.every((reward) => !reward)) {
      return undefined
    }

    return {
      eraIndex,
      amount: partialRewards.reduce((sum: BigNumber, next) => sum.plus(next!), new BigNumber(0)).toFixed(0),
      exposures: exposuresWithValidators
        ?.map(([validator, _, exposure]) => [
          validator.asString(),
          exposure?.others.elements.findIndex((element) => element.first.compare(accountId) === 0)
        ])
        .filter(([_, index]) => index !== undefined) as [string, number][]
    }
  }

  private calculateValidatorReward(totalReward: BigNumber, totalPoints: BigNumber, validatorPoints: BigNumber): BigNumber {
    return validatorPoints.dividedBy(totalPoints).multipliedBy(totalReward)
  }

  private calculateNominatorReward(
    validatorReward: BigNumber,
    validatorCommission: BigNumber,
    totalStake: BigNumber,
    nominatorStake: BigNumber
  ): BigNumber {
    const nominatorShare = nominatorStake.dividedBy(totalStake)

    return new BigNumber(1).minus(validatorCommission.dividedBy(1_000_000_000)).multipliedBy(validatorReward).multipliedBy(nominatorShare)
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private async getAvailableStakingActions(
    stakingDetails: SubstrateStakingDetails | undefined,
    nominations: SubstrateNominations | undefined,
    validatorIds: SubstrateAccountId<SubstrateSS58Address>[],
    maxDelegationValue: BigNumber
  ): Promise<DelegatorAction[]> {
    const availableActions: DelegatorAction[] = []

    const currentValidators = nominations?.targets?.elements?.map((target) => target.asAddress()) || []
    const validatorAddresses = validatorIds.map((id) => this.substrateAddressFrom(id).asString())

    const isBonded = new BigNumber(stakingDetails?.active ?? 0).gt(0)
    const isDelegating = nominations !== undefined
    const isUnbonding = stakingDetails && stakingDetails.locked.length > 0

    const minBondingValue = await this.nodeClient.getExistentialDeposit()
    const minDelegationValue = new BigNumber(1)

    const electionStatus = await this.nodeClient.getElectionStatus().then((eraElectionStatus) => eraElectionStatus?.status.value)
    const isElectionClosed = electionStatus !== SubstrateElectionStatus.OPEN

    const hasFundsToWithdraw = new BigNumber(stakingDetails?.unlocked ?? 0).gt(0)

    if (maxDelegationValue.gt(minBondingValue ?? 0) && !isBonded && !isUnbonding && isElectionClosed) {
      availableActions.push({
        type: SubstrateStakingActionType.BOND_NOMINATE,
        args: ['targets', 'controller', 'value', 'payee']
      })
    }

    if (maxDelegationValue.gt(minDelegationValue) && isBonded && !isUnbonding && isElectionClosed) {
      availableActions.push({
        type: SubstrateStakingActionType.BOND_EXTRA,
        args: ['value']
      })
    }

    if (isBonded && !isDelegating && !isUnbonding && isElectionClosed) {
      availableActions.push(
        {
          type: SubstrateStakingActionType.NOMINATE,
          args: ['targets']
        },
        {
          type: SubstrateStakingActionType.UNBOND,
          args: ['value']
        }
      )
    }

    if (isUnbonding && !isDelegating && isElectionClosed) {
      availableActions.push({
        type: SubstrateStakingActionType.REBOND_NOMINATE,
        args: ['targets', 'value']
      })
    }

    if (isUnbonding && isDelegating && isElectionClosed) {
      availableActions.push({
        type: SubstrateStakingActionType.REBOND_EXTRA,
        args: ['value']
      })
    }

    if (isDelegating && isElectionClosed) {
      if (
        validatorAddresses.every((validator) => currentValidators.includes(validator)) &&
        validatorAddresses.length === currentValidators.length
      ) {
        availableActions.push({
          type: SubstrateStakingActionType.CANCEL_NOMINATION,
          args: ['value']
        })
      } else if (validatorAddresses.length > 0) {
        availableActions.push({
          type: SubstrateStakingActionType.CHANGE_NOMINATION,
          args: ['targets']
        })
      }
    }

    if (hasFundsToWithdraw && isElectionClosed) {
      availableActions.push({
        type: SubstrateStakingActionType.WITHDRAW_UNBONDED,
        args: []
      })
    }

    availableActions.sort((a, b) => a.type - b.type)

    return availableActions
  }

  private async getAccountIdentityInfo(address: SubstrateSS58Address): Promise<SubstrateIdentityInfo | undefined> {
    try {
      const registration = await this.nodeClient.getIdentityOf(address)

      if (registration) {
        return registration.identityInfo
      }

      const superOf = await this.nodeClient.getSuperOf(address)

      return superOf ? this.getAccountIdentityInfo(superOf.first.address) : undefined
    } catch {
      return undefined
    }
  }

  private partitionArray<T>(array: T[], predicate: (value: T) => boolean): [T[], T[]] {
    const partitioned: [T[], T[]] = [[], []]
    for (const item of array) {
      const index = predicate(item) ? 0 : 1
      partitioned[index].push(item)
    }

    return partitioned
  }
}
