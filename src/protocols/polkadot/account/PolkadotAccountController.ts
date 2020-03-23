import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { KeyPair } from '../../../data/KeyPair'
import { bip39ToMiniSecret } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../../utils/sr25519'
import { PolkadotAddress } from './PolkadotAddress'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { DelegatorAction } from '../../ICoinDelegateProtocol'
import { PolkadotStakingActionType } from '../staking/PolkadotStakingActionType'
import { PolkadotStakingInfo } from '../staking/PolkadotStakingLedger'

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
        const results = await Promise.all([
            this.nodeClient.getLedger(PolkadotAddress.from(addressOrPublicKey)),
            this.nodeClient.getCurrentEraIndex()
        ])

        const stakingLedger = results[0]
        const currentEra = results[1]

        if (!stakingLedger || !currentEra) {
            return null
        }

        const [locked, unlocked] = this.partitionArray(
            stakingLedger.unlocking.elements.map(entry => [entry.first.value, entry.second.value] as [BigNumber, BigNumber]),
            ([_, era]) => currentEra.lte(era)
        )

        const reduceValues = (total: BigNumber, [value, _]: [BigNumber, BigNumber]) => total.plus(value)
        const totalLocked = locked.reduce(reduceValues, new BigNumber(0))
        const totalUnlocked = unlocked.reduce(reduceValues, new BigNumber(0))

        return {
            total: stakingLedger.total.value,
            active: stakingLedger.active.value,
            locked: totalLocked,
            unlocked: totalUnlocked
        }
    }

    public async calculateMaxDelegationValue(addressOrPublicKey: string | PolkadotAddress): Promise<BigNumber> {
        const results = await Promise.all([
            this.getBalance(addressOrPublicKey),
            this.getStakingInfo(addressOrPublicKey)
        ])

        const currentBalance = results[0]
        const stakingInfo = results[1]

        if (!currentBalance || !stakingInfo) {
            return new BigNumber(0)
        }

        // TODO: estimate fees
        const maxValue = currentBalance.minus(stakingInfo.total)

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

        if (!isBonded) {
            availableActions.push({
                type: PolkadotStakingActionType.BOND_NOMINATE,
                args: ['targets', 'controller', 'value', 'payee']
            })
        } else if (maxDelegationValue && minDelegationValue && maxDelegationValue.gt(minDelegationValue)) {
            availableActions.push({
                type: PolkadotStakingActionType.BOND_EXTRA,
                args: ['value']
            })
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