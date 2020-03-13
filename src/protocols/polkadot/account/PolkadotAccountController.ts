import { PolkadotNodeClient } from '../node/PolkadotNodeClient'
import { KeyPair } from '../../../data/KeyPair'
import { bip39ToMiniSecret } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../../utils/sr25519'
import { PolkadotAddress } from './PolkadotAddress'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

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
        const accountId = PolkadotAddress.fromEncoded(address).getBufferPublicKey()
        return this.nodeClient.getBalance(accountId)
    }

    public async isDelegating(publicKey: string): Promise<boolean> {
        const nominations = await this.nodeClient.getNominations(publicKey)
        return nominations != null
    }
}