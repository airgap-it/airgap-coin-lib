import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { KeyPair } from '../../../data/KeyPair'
import { bip39ToMiniSecret } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../../utils/sr25519'
import { PolkadotAddress } from './PolkadotAddress'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { DelegatorActions } from '../../ICoinDelegateProtocol'
import { PolkadotStakingActionType } from '../staking/PolkadotStakingActionType'

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

    public async createAddress(publicKey: string): Promise<string> {
        return PolkadotAddress.fromPublicKey(publicKey).toString()
    }

    public async getBalance(address: string): Promise<BigNumber> {
        return this.nodeClient.getBalance(PolkadotAddress.fromEncoded(address))
    }

    public async isBonded(address: string): Promise<boolean> {
        const bonded = await this.nodeClient.getBonded(PolkadotAddress.fromEncoded(address))
        return bonded != null
    }

    public async isNominating(address: string): Promise<boolean> {
        const nominations = await this.nodeClient.getNominations(PolkadotAddress.fromEncoded(address))
        return nominations != null
    }

    public async getAvailableDelegatorActions(publicKey: string): Promise<DelegatorActions[]> {
        const availableActions: DelegatorActions[] = []

        const results = await Promise.all([
            this.isBonded(publicKey),
            this.isNominating(publicKey),
        ])

        const isBonded = results[0]
        const isDelegating = results[1]

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

        return availableActions
    }
}