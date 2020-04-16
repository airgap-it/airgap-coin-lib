import { SubstrateNodeClient } from './node/SubstrateNodeClient'
import { KeyPair } from '../../../data/KeyPair'
import { bip39ToMiniSecret } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../../utils/sr25519'
import { SubstrateAddress, SubstrateAccountId } from './data/account/SubstrateAddress'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { DelegatorAction } from '../../ICoinDelegateProtocol'
import { SubstrateStakingActionType } from './data/staking/SubstrateStakingActionType'
import { SubstrateValidatorDetails, SubstrateValidatorStatus, SubstrateValidatorRewardDetails } from './data/staking/SubstrateValidatorDetails'
import { SubstrateNominatorDetails, SubstrateStakingDetails, SubstrateStakingStatus, SubstrateNominatorRewardDetails, SubstrateLockedDetails } from './data/staking/SubstrateNominatorDetails'
import { SubstrateNominations } from './data/staking/SubstrateNominations'
import { SubstrateStakingLedger } from './data/staking/SubstrateStakingLedger'
import { SubstrateActiveEraInfo } from './data/staking/SubstrateActiveEraInfo'
import { SubstrateExposure } from './data/staking/SubstrateExposure'
import { SubstrateRegistration } from './data/account/SubstrateRegistration'
import { SubstrateValidatorPrefs } from './data/staking/SubstrateValidatorPrefs'
import { SubstrateNetwork } from '../SubstrateNetwork'

export class SubstrateAccountController {
    constructor(
        readonly network: SubstrateNetwork,
        readonly nodeClient: SubstrateNodeClient
    ) {}

    public async createKeyPairFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<KeyPair> {
        const secret = bip39ToMiniSecret(mnemonic, password || '')
        return this.createKeyPairFromHexSecret(Buffer.from(secret).toString('hex'), derivationPath)
    }

    public async createKeyPairFromHexSecret(secret: string, derivationPath: string): Promise<KeyPair> {
        return createSr25519KeyPair(secret, derivationPath)
    }

    public async createAddressFromPublicKey(publicKey: string): Promise<string> {
        return SubstrateAddress.from(publicKey, this.network).toString()
    }

    public async getBalance(accountId: SubstrateAccountId): Promise<BigNumber> {
        const accountInfo = await this.nodeClient.getAccountInfo(SubstrateAddress.from(accountId, this.network))
        if (!accountInfo) {
            return new BigNumber(0)
        }

        return accountInfo.data.free.value
    }

    public async getTransferableBalance(accountId: SubstrateAccountId): Promise<BigNumber> {
        const results = await Promise.all([
            this.nodeClient.getAccountInfo(SubstrateAddress.from(accountId, this.network)),
            this.nodeClient.getExistentialDeposit()
        ])

        const accountInfo = results[0]
        const minBalance = results[1]

        if (!accountInfo) {
            return new BigNumber(0)
        }

        const free = accountInfo.data.free.value
        const reserved = accountInfo.data.reserved.value
        const locked = accountInfo.data.miscFrozen.value
        
        return free
            .minus(reserved)
            .minus(locked)
            .minus(minBalance || 0)
    }

    public async isBonded(accountId: SubstrateAccountId): Promise<boolean> {
        const bonded = await this.nodeClient.getBonded(SubstrateAddress.from(accountId, this.network))
        return bonded != null
    }

    public async isNominating(accountId: SubstrateAccountId): Promise<boolean> {
        const nominations = await this.nodeClient.getNominations(SubstrateAddress.from(accountId, this.network))
        return nominations != null
    }

    public async getCurrentValidators(accountId: SubstrateAccountId): Promise<string[]> {
        const nominations = await this.nodeClient.getNominations(SubstrateAddress.from(accountId, this.network))
        if (nominations) {
            return nominations.targets.elements.map(target => target.asAddress())
        }

        return []
    }

    public async getValidatorDetails(accountId: SubstrateAccountId): Promise<SubstrateValidatorDetails> {
        const address = SubstrateAddress.from(accountId, this.network)
        const currentEra = await this.nodeClient.getCurrentEraIndex()

        let identity: SubstrateRegistration | null = null
        let status: SubstrateValidatorStatus | null = null
        let exposure: SubstrateExposure | null = null
        let validatorPrefs: SubstrateValidatorPrefs | null = null
        let lastEraReward: SubstrateValidatorRewardDetails | null = null
        if (currentEra) {            
            const results = await Promise.all([
                this.nodeClient.getIdentityOf(address).catch(_ => null),
                this.nodeClient.getValidators(),
                this.nodeClient.getValidatorPrefs(currentEra.toNumber(), address),
                this.nodeClient.getValidatorExposure(address)
            ])

            identity = results[0]
            const currentValidators = results[1]
            validatorPrefs = results[2]
            exposure = results[3]

            lastEraReward = await this.getEraValidatorReward(address, currentEra.toNumber() - 1)

            // TODO: check if reaped
            if (currentValidators && currentValidators.find(current => current.compare(address) == 0)) {
                status = 'Active'
            } else if (currentValidators) {
                status = 'Inactive'
            }
        }
        
        return {
            name: identity ? identity.identityInfo.display : null,
            status,
            ownStash: exposure ? exposure.own.toString() : null,
            totalStakingBalance: exposure ? exposure.total.toString() : null,
            commission: validatorPrefs 
                ? validatorPrefs.commission.value.dividedBy(1_000_000_000).toString() // commission is Perbill (parts per billion)
                : null, 
            lastEraReward
        }
    }

    public async getNominatorDetails(accountId: SubstrateAccountId): Promise<SubstrateNominatorDetails> {
        const address = SubstrateAddress.from(accountId, this.network)

        const results = await Promise.all([
            this.getBalance(address),
            this.getTransferableBalance(address),
            this.nodeClient.getStakingLedger(address),
            this.nodeClient.getNominations(address),
            this.nodeClient.getActiveEraInfo(),
            this.nodeClient.getExpectedEraDuration(),
            this.nodeClient.getExistentialDeposit()
        ])

        const balance = results[0]
        const transferableBalance = results[1]
        const stakingLedger = results[2]
        const nominations = results[3]
        const activeEra = results[4]
        const expectedEraDuration = results[5]
        const existentialDeposit = results[6]

        if (!balance || !transferableBalance || !activeEra || !expectedEraDuration || !existentialDeposit) {
            return Promise.reject('Could not fetch nominator details.')
        }

        const stakingDetails = await this.getStakingDetails(accountId, stakingLedger, nominations, activeEra, expectedEraDuration)
        const availableActions = await this.getAvailableStakingActions(stakingDetails, existentialDeposit, transferableBalance)

        return {
            balance: balance.toString(),
            isDelegating: nominations !== null,
            availableActions,
            stakingDetails
        }
    }

    public async getUnclaimedRewards(accountId: SubstrateAccountId): Promise<SubstrateNominatorRewardDetails[]> {
        const results = await Promise.all([
            this.nodeClient.getStakingLedger(SubstrateAddress.from(accountId, this.network)),
            this.nodeClient.getNominations(SubstrateAddress.from(accountId, this.network)),
            this.nodeClient.getActiveEraInfo()
        ])

        const stakingLedger = results[0]
        const nominations = results[1]
        const activeEra = results[2]

        if (!stakingLedger || !stakingLedger.lastReward.value || !nominations) {
            return []
        }

        if (!activeEra) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        return this.getNominatorRewards(
            accountId,
            nominations.targets.elements.map(id => id.address),
            activeEra,
            stakingLedger.lastReward.value.toNumber(),
            activeEra.index.minus(stakingLedger.lastReward.value.value).toNumber()
        ).then(rewards => rewards.filter(reward => !reward.collected))
    }

    private async getStakingDetails(
        accountId: SubstrateAccountId,
        stakingLedger: SubstrateStakingLedger | null,
        nominations: SubstrateNominations | null,
        activeEra: SubstrateActiveEraInfo,
        expectedEraDuration: BigNumber
    ): Promise<SubstrateStakingDetails | null> {
        if (!stakingLedger) {
            return null
        }

        const unlockingDetails = this.getUnlockingDetails(
            stakingLedger.unlocking.elements.map(tuple => [tuple.first.value, tuple.second.value] as [BigNumber, BigNumber]),
            activeEra,
            expectedEraDuration
        )

        const stakingStatus = this.getStakingStatus(nominations, activeEra.index.toNumber())

        const rewards = nominations && stakingLedger.lastReward.value ? await this.getNominatorRewards(
            accountId, 
            nominations.targets.elements.map(id => id.address),
            activeEra,
            stakingLedger.lastReward.value.toNumber(),
            activeEra.index.minus(stakingLedger.lastReward.value).toNumber() + 5
        ) : []

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
    ): { locked: SubstrateLockedDetails[], unlocked: string } {
        const [locked, unlocked] = this.partitionArray(
            unlocking,
            ([_, era]) => activeEra.index.lte(era)
        )

        const lockedDetails = locked.map(([value, era]: [BigNumber, BigNumber]) => {
            const eraStart = activeEra.start.value?.value || new BigNumber(0)
            const estimatedDuration = era.minus(activeEra.index.value).multipliedBy(expectedEraDuration)
            const expectedUnlock = eraStart.plus(estimatedDuration)

            return { 
                value: value.toString(10), 
                expectedUnlock: expectedUnlock.toNumber()
            }
        })

        const totalUnlocked = unlocked.reduce(
            (total: BigNumber, [value, _]: [BigNumber, BigNumber]) => total.plus(value), 
            new BigNumber(0)
        )

        return {
            locked: lockedDetails,
            unlocked: totalUnlocked.toString()
        }
    }

    private getStakingStatus(nominations: SubstrateNominations | null, eraIndex: number): SubstrateStakingStatus {
        if (nominations === null) {
            return 'bonded'
        } else if (nominations.submittedIn.lt(eraIndex)) {
            return 'nominating'
        } else {
            return 'nominating_inactive'
        }
    }

    private async getEraValidatorReward(
        accountId: SubstrateAccountId,
        eraIndex: number
    ): Promise<SubstrateValidatorRewardDetails | null> {
        const address = SubstrateAddress.from(accountId, this.network)

        const results = await Promise.all([
            this.nodeClient.getValidatorReward(eraIndex),
            this.nodeClient.getRewardPoints(eraIndex),
            this.nodeClient.getStakersClipped(eraIndex, address),
            this.nodeClient.getValidatorPrefs(eraIndex, address)
        ])

        if (results.some(result => !result)) {
            return null
        }

        const eraReward = results[0]
        const eraPoints = results[1]
        const exposureClipped = results[2]
        const validatorPrefs = results[3]

        const validatorPoints = eraPoints?.individual?.elements
            ?.find(element => element.first.address.compare(address))
            ?.second?.value

        if (!eraReward || !eraPoints || !exposureClipped || !validatorPrefs || !validatorPoints) {
            return null
        }

        const validatorReward = this.calculateValidatorReward(
            eraReward,
            eraPoints.total.value,
            validatorPoints
        )

        return {
            amount: validatorReward.toFixed(),
            totalStake: exposureClipped.total.toString(),
            ownStake: exposureClipped.own.toString(),
            commission: validatorPrefs.commission.toString()
        }
    }

    private async getNominatorRewards(
        accountId: SubstrateAccountId, 
        validators: SubstrateAccountId[],
        activeEra: SubstrateActiveEraInfo,
        lastReward: number,
        limit: number
    ): Promise<SubstrateNominatorRewardDetails[]> {
        const address = SubstrateAddress.from(accountId, this.network)
        const expectedEraDuration = await this.nodeClient.getExpectedEraDuration()

        if (!expectedEraDuration) {
            return Promise.reject('Could not fetch all necessary data.')
        }

        const eras = Array.from(Array(limit).keys()).map(index => activeEra.index.toNumber() - 1 - index)
        const rewards = await Promise.all(eras.map(era => 
            this.calculateEraNominatorReward(
                address,
                validators.map(validator => SubstrateAddress.from(validator, this.network)),
                era
            ).then(partial => {
                if (partial) {
                    const rewardEra = partial.eraIndex || activeEra.index.toNumber()
                    const erasPassed = activeEra.index.minus(rewardEra).toNumber()

                    partial.collected = lastReward >= rewardEra
                    partial.timestamp = activeEra.start.value 
                        ? activeEra.start.value.minus(expectedEraDuration.multipliedBy(erasPassed - 1)).toNumber()
                        : 0
                }
                
                return partial as SubstrateNominatorRewardDetails
            })
        ))
        return rewards.filter(reward => reward)
    }

    private async calculateEraNominatorReward(
        accountId: SubstrateAccountId,
        validators: SubstrateAccountId[],
        eraIndex: number
    ): Promise<Partial<SubstrateNominatorRewardDetails> | null> {
        const results = await Promise.all([
            this.nodeClient.getValidatorReward(eraIndex),
            this.nodeClient.getRewardPoints(eraIndex),
            Promise.all(validators.map(async validator => [
                SubstrateAddress.from(validator, this.network), 
                await this.nodeClient.getValidatorPrefs(eraIndex, SubstrateAddress.from(validator, this.network))
                    .then(prefs => prefs?.commission?.value),
                await this.nodeClient.getStakersClipped(eraIndex, SubstrateAddress.from(validator, this.network))
            ] as [SubstrateAddress, BigNumber | null, SubstrateExposure | null])),
        ])

        const reward = results[0]
        const rewardPoints = results[1]
        const exposuresWithValidators = results[2]

        if (!reward || !rewardPoints || !exposuresWithValidators) {
            return null
        }

        const partialRewards = exposuresWithValidators
            .map(([validator, commission, exposure]) => {
                const validatorPoints = rewardPoints.individual.elements
                    .find(element => element.first.address.compare(validator) === 0)
                    ?.second?.value

                const nominatorStake = exposure?.others.elements
                    .find(element => element.first.address.compare(accountId) === 0)
                    ?.second?.value

                if (commission && exposure && validatorPoints && nominatorStake) {
                    const validatorReward = this.calculateValidatorReward(
                        reward, 
                        rewardPoints.total.value,
                        validatorPoints
                    )

                    return this.calculateNominatorReward(
                        validatorReward,
                        commission,
                        exposure.total.value,
                        nominatorStake
                    )
                } else {
                    return null
                }
            })
            .filter(reward => reward !== null)

        if (partialRewards.every(reward => !reward)) {
            return null
        }

        return {
            eraIndex,
            amount: partialRewards.reduce((sum: BigNumber, next) => sum.plus(next!), new BigNumber(0)).toFixed(0),
            exposures: exposuresWithValidators?.map(([validator, _, exposure]) => [
                validator.toString(), 
                exposure?.others.elements.findIndex(element => element.first.address.compare(accountId) === 0)
            ]).filter(([_, index]) => index !== undefined) as [string, number][]
        }
    }

    private calculateValidatorReward(
        totalReward: BigNumber,
        totalPoints: BigNumber,
        validatorPoints: BigNumber,
    ): BigNumber {
        return validatorPoints
            .dividedBy(totalPoints)
            .multipliedBy(totalReward)    
    }

    private calculateNominatorReward(
        validatorReward: BigNumber,
        validatorCommission: BigNumber,
        totalStake: BigNumber,
        nominatorStake: BigNumber
    ): BigNumber {
        const nominatorShare = nominatorStake.dividedBy(totalStake)

        return new BigNumber(1)
            .minus(validatorCommission.dividedBy(1_000_000_000))
            .multipliedBy(validatorReward)
            .multipliedBy(nominatorShare)
    }

    private async getAvailableStakingActions(
        stakingDetails: SubstrateStakingDetails | null,
        minDelegationValue: BigNumber,
        maxDelegationValue: BigNumber
    ): Promise<DelegatorAction[]> {
        const availableActions: DelegatorAction[] = []

        const isBonded = stakingDetails !== null
        const isDelegating = stakingDetails && stakingDetails.status !== 'bonded'

        const hasFundsToWithdraw = new BigNumber(stakingDetails?.unlocked || 0).gt(0)
        const hasRewardsToCollect = stakingDetails?.rewards.some(reward => !reward.collected)

        if (maxDelegationValue.gt(minDelegationValue)) {
            if (!isBonded) {
                availableActions.push({
                    type: SubstrateStakingActionType.BOND_NOMINATE,
                    args: ['targets', 'controller', 'value', 'payee']
                })
            } else {
                availableActions.push({
                    type: SubstrateStakingActionType.BOND_EXTRA,
                    args: ['value']
                })
            }
        }
        
        if (isDelegating) {
            availableActions.push(
                {
                    type: SubstrateStakingActionType.CHANGE_NOMINATION,
                    args: ['targets']
                },
                {
                    type: SubstrateStakingActionType.CANCEL_NOMINATION,
                    args: []
                }
            )

            if (hasRewardsToCollect) {
                availableActions.push({
                    type: SubstrateStakingActionType.COLLECT_REWARDS,
                    args: ['rewards']
                })
            }
        }

        if (hasFundsToWithdraw) {
            availableActions.push({
                type: SubstrateStakingActionType.WITHDRAW_UNBONDED,
                args: []
            })
        }

        availableActions.sort((a, b) => a.type - b.type)

        return availableActions
    }

    private partitionArray<T>(array: T[], predicate: (value: T) => boolean): [T[], T[]] {
        const partitioned: [T[], T[]]= [[], []]
        for (let item of array) {
            const index = predicate(item) ? 0 : 1
            partitioned[index].push(item)
        }

        return partitioned
    }
}