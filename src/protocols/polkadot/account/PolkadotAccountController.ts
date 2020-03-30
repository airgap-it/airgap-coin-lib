import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { KeyPair } from '../../../data/KeyPair'
import { bip39ToMiniSecret } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../../utils/sr25519'
import { PolkadotAddress } from './PolkadotAddress'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { DelegatorAction } from '../../ICoinDelegateProtocol'
import { PolkadotStakingActionType } from '../staking/PolkadotStakingActionType'
import { PolkadotStakingInfo, PolkadotStakingStatus, PolkadotReward } from '../staking/PolkadotStakingLedger'

type FutureFeeEstimationType = 'transfer' | 'delegation'

export class PolkadotAccountController {
    constructor(
        readonly nodeClient: PolkadotNodeClient
    ) {}

    public async createKeyPairFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<KeyPair> {
        const secret = bip39ToMiniSecret(mnemonic, password || '')
        return this.createKeyPairFromHexSecret(Buffer.from(secret).toString('hex'), derivationPath)
    }

    public async createKeyPairFromHexSecret(secret: string, derivationPath: string): Promise<KeyPair> {
        return createSr25519KeyPair(secret, derivationPath)
    }

    public async createAddressFromPublicKey(publicKey: string): Promise<string> {
        return PolkadotAddress.from(publicKey).toString()
    }

    public async getBalance(addressOrPublicKey: string | PolkadotAddress): Promise<BigNumber> {
        return this.nodeClient.getBalance(PolkadotAddress.from(addressOrPublicKey))
    }

    public async isBonded(addressOrPublicKey: string | PolkadotAddress): Promise<boolean> {
        const bonded = await this.nodeClient.getBonded(PolkadotAddress.from(addressOrPublicKey))
        return bonded != null
    }

    public async isNominating(addressOrPublicKey: string | PolkadotAddress): Promise<boolean> {
        const nominations = await this.nodeClient.getNominations(PolkadotAddress.from(addressOrPublicKey))
        return nominations != null
    }

    public async getStakingInfo(addressOrPublicKey: string | PolkadotAddress): Promise<PolkadotStakingInfo | null> {
        const address = PolkadotAddress.from(addressOrPublicKey)
        const results = await Promise.all([
            this.nodeClient.getNominations(address),
            this.nodeClient.getLedger(address),
            this.nodeClient.getExpectedEraDuration(),
            this.nodeClient.getActiveEraInfo(),
        ])

        const nominations = results[0]
        const stakingLedger = results[1]
        const expectedEraDuration = results[2]
        const activeEraInfo = results[3]

        if (!stakingLedger || !expectedEraDuration || !activeEraInfo) {
            return null
        }

        const [locked, unlocked] = this.partitionArray(
            stakingLedger.unlocking.elements.map(entry => [entry.first.value, entry.second.value] as [BigNumber, BigNumber]),
            ([_, era]) => activeEraInfo.index.value.lte(era)
        )

        const lockedWithTime = locked.map(([value, era]: [BigNumber, BigNumber]) => {
            const eraStart = activeEraInfo.start.value?.value || new BigNumber(0)
            const estimatedDuration = era.minus(activeEraInfo.index.value).multipliedBy(expectedEraDuration)
            const expectedUnlock = eraStart.plus(estimatedDuration)

            return { value, expectedUnlock }
        })
        const totalUnlocked = unlocked.reduce((total: BigNumber, [value, _]: [BigNumber, BigNumber]) => total.plus(value), new BigNumber(0))

        let status: PolkadotStakingStatus
        if (nominations === null) {
            status = 'bonded'
        } else if (nominations.submittedIn.value.lt(activeEraInfo.index.value)) {
            status = 'nominating'
        } else {
            status = 'nominating_inactive'
        }

        const nextEra = activeEraInfo.start.value?.value.plus(expectedEraDuration).toNumber() || 0

        const rewards = nominations ? await this.nodeClient.getRewards(
            address, 
            nominations.targets.elements.map(element => element.address), 
            activeEraInfo.index.toNumber(),
            5
        ) : []

        return {
            total: stakingLedger.total.value,
            active: stakingLedger.active.value,
            locked: lockedWithTime,
            unlocked: totalUnlocked,
            status,
            nextEra,
            previousRewards: rewards
        }
    }

    public async getNotCollectedRewards(addressOrPublicKey: string | PolkadotAddress): Promise<PolkadotReward[]> {
        const stakingInfo = await this.getStakingInfo(addressOrPublicKey)
        return stakingInfo?.previousRewards.filter(reward => !reward.collected) || []
    }

    public async estimateFutureRequiredFees(addressOrPublicKey, estimationType: FutureFeeEstimationType): Promise<BigNumber | null> {
        const results = await Promise.all([
            this.isNominating(addressOrPublicKey),
            this.isBonded(addressOrPublicKey),
            this.nodeClient.getBaseTransactionFee()
        ])

        const isNominating = results[0]
        const isBonded = results[1]
        const baseTransactionFee = results[2]

        if (!baseTransactionFee) {
            return Promise.reject('Could not fetch transaction fee information.')
        }

        let requiredFees = 0

        if (!isBonded && estimationType === 'delegation') {
            requiredFees += 5 // bond + nomination + chill + unbond + withdraw
        } else if (isBonded) {
            requiredFees += 2 // unbond + withdraw
        }

        if (isNominating) {
            requiredFees += 2 // 1x claim rewards + chill
        }

        const safetyFactor = 1.5
        return baseTransactionFee.multipliedBy(requiredFees).multipliedBy(safetyFactor)
    }

    // make sure it's enough
    public async calculateMaxDelegationValue(addressOrPublicKey: string | PolkadotAddress): Promise<BigNumber> {
        const results = await Promise.all([
            this.getBalance(addressOrPublicKey),
            this.getStakingInfo(addressOrPublicKey),
            this.nodeClient.getExistentialDeposit(),
            this.estimateFutureRequiredFees(addressOrPublicKey, 'delegation')
        ])

        const currentBalance = results[0]
        const stakingInfo = results[1]
        const existentialDeposit = results[2]
        const futureRequiredFees = results[3]

        if (!currentBalance || !existentialDeposit || !futureRequiredFees) {
            return new BigNumber(0)
        }

        const maxValue = currentBalance
            .minus(stakingInfo?.total || 0)
            .minus(existentialDeposit)
            .minus(futureRequiredFees)

        return maxValue
    }

    public async getAvailableDelegatorActions(addressOrPublicKey: string | PolkadotAddress): Promise<DelegatorAction[]> {
        const availableActions: DelegatorAction[] = []

        const results = await Promise.all([
            this.isBonded(addressOrPublicKey),
            this.isNominating(addressOrPublicKey),
            this.getStakingInfo(addressOrPublicKey),
            this.nodeClient.getExistentialDeposit(),
            this.calculateMaxDelegationValue(addressOrPublicKey)
        ])

        const isBonded = results[0]
        const isDelegating = results[1]
        const stakingInfo = results[2]

        const minDelegationValue = results[3]
        const maxDelegationValue = results[4]

        const hasFundsToWithdraw = stakingInfo?.unlocked?.gt(0)
        const hasRewardsToCollect = stakingInfo?.previousRewards.some(reward => !reward.collected)

        if (maxDelegationValue && minDelegationValue && maxDelegationValue.gt(minDelegationValue)) {
            if (!isBonded) {
                availableActions.push({
                    type: PolkadotStakingActionType.BOND_NOMINATE,
                    args: ['targets', 'controller', 'value', 'payee']
                })
            } else {
                availableActions.push({
                    type: PolkadotStakingActionType.BOND_EXTRA,
                    args: ['value']
                })
            }
        }
        
        if (isDelegating) {
            availableActions.push(
                {
                    type: PolkadotStakingActionType.CHANGE_NOMINATION,
                    args: ['targets']
                },
                {
                    type: PolkadotStakingActionType.CANCEL_NOMINATION,
                    args: []
                }
            )

            if (hasRewardsToCollect) {
                availableActions.push({
                    type: PolkadotStakingActionType.COLLECT_REWARDS,
                    args: []
                })
            }
        }

        if (hasFundsToWithdraw) {
            availableActions.push({
                type: PolkadotStakingActionType.WITHDRAW_UNBONDED,
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