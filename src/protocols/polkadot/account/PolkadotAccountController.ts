import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { KeyPair } from '../../../data/KeyPair'
import { bip39ToMiniSecret } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../../utils/sr25519'
import { PolkadotAddress } from './PolkadotAddress'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { DelegatorAction } from '../../ICoinDelegateProtocol'
import { PolkadotStakingActionType } from '../staking/PolkadotStakingActionType'

type WithdrawFundsOption = 'locked' | 'unlocked'

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

    public async getFundsToWithdraw(addressOrPublicKey: string | PolkadotAddress, option: WithdrawFundsOption): Promise<BigNumber | null> {
        const results = await Promise.all([
            this.nodeClient.getLedger(PolkadotAddress.from(addressOrPublicKey)),
            this.nodeClient.getCurrentEraIndex()
        ])

        const stakingLedger = results[0]
        const currentEra = results[1]

        if (!stakingLedger || !currentEra) {
            return null
        }

        return stakingLedger.unlocking.elements
            .map(entry => [entry.first.value, entry.second.value] as [BigNumber, BigNumber])
            .filter(([_, era]: [BigNumber, BigNumber]) => option === 'unlocked' ? era.lte(currentEra) : era.gt(currentEra))
            .reduce((total: BigNumber, [value, _]: [BigNumber, BigNumber]) => total.plus(value), new BigNumber(0))
    }

    public async getAvailableDelegatorActions(addressOrPublicKey: string | PolkadotAddress): Promise<DelegatorAction[]> {
        const availableActions: DelegatorAction[] = []

        const results = await Promise.all([
            this.isBonded(addressOrPublicKey),
            this.isNominating(addressOrPublicKey),
            this.getFundsToWithdraw(addressOrPublicKey, 'unlocked')
        ])

        const isBonded = results[0]
        const isDelegating = results[1]
        const hasFundsToWithdraw = results[2]?.gt(0)

        if (!isBonded) {
            availableActions.push({
                type: PolkadotStakingActionType.BOND_NOMINATE,
                args: ['targets', 'controller', 'value', 'payee']
            })
        } else if (isBonded && !isDelegating) {
            availableActions.push(
                {
                    type: PolkadotStakingActionType.NOMINATE,
                    args: ['targets']
                },
                {
                    type: PolkadotStakingActionType.UNBOND,
                    args: ['value']
                },
                {
                    type: PolkadotStakingActionType.CHANGE_REWARD_DESTINATION,
                    args: ['payee']
                },
                {
                    type: PolkadotStakingActionType.CHANGE_CONTROLLER,
                    args: ['controller']
                }
            )
        } else if (isDelegating) {
            availableActions.push(
                {
                    type: PolkadotStakingActionType.CANCEL_NOMINATION,
                    args: []
                },
                {
                    type: PolkadotStakingActionType.BOND_EXTRA,
                    args: ['value']
                },
                {
                    type: PolkadotStakingActionType.CHANGE_REWARD_DESTINATION,
                    args: ['payee']
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
}