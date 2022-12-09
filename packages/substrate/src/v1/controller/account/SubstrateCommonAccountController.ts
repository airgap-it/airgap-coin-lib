import { assertNever, Domain } from '@airgap/coinlib-core'
import { KeyPair as RawKeyPair } from '@airgap/coinlib-core/data/KeyPair'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
import * as bitcoinJS from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { Secret, KeyPair, PublicKey, newSecretKey, newPublicKey } from '@airgap/module-kit'
import { bip39ToMiniSecret, waitReady } from '@polkadot/wasm-crypto'
import { createSr25519KeyPair } from '../../utils/sr25519'
import { SubstrateAccountId } from '../../data/account/address/SubstrateAddress'
import { substrateAddressFactory, TypedSubstrateAddress } from '../../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountBalance } from '../../data/account/SubstrateAccountBalance'
import { SubstrateAccountInfo } from '../../data/account/SubstrateAccountInfo'
import { SubstrateNodeClient } from '../../node/SubstrateNodeClient'
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SubstrateAccountController } from './SubstrateAccountController'

export class SubstrateCommonAccountController<C extends SubstrateProtocolConfiguration, NodeClient extends SubstrateNodeClient<C>>
  implements SubstrateAccountController<C> {
  public constructor(protected readonly configuration: C, protected readonly nodeClient: NodeClient) {}

  public async createKeyPairFromSecret(secret: Secret, derivationPath?: string | undefined): Promise<KeyPair> {
    switch (secret.type) {
      case 'hex':
        return this.createKeyPairFromHexSecret(secret.value, derivationPath)
      case 'mnemonic':
        return this.createKeyPairFromMnemonic(secret.value, secret.password, derivationPath)
      default:
        assertNever(secret)
        throw new UnsupportedError(Domain.SUBSTRATE, 'Unknown secret type')
    }
  }

  private async createKeyPairFromMnemonic(mnemonic: string, password?: string, derivationPath?: string): Promise<KeyPair> {
    switch (this.configuration.account.type) {
      case 'eth':
        return this.createEthKeyPairFromMnemonic(mnemonic, password, derivationPath)
      case 'ss58':
        return this.createSS58KeyPairFromMnemonic(mnemonic, password, derivationPath)
      default:
        assertNever(this.configuration.account)
        throw new UnsupportedError(Domain.SUBSTRATE, 'Unknown account configuration type')
    }
  }

  private createEthKeyPairFromMnemonic(mnemonic: string, password?: string, derivationPath?: string): KeyPair {
    const secret = mnemonicToSeed(mnemonic || '', password)

    return this.createEthKeyPairFromHexSecret(Buffer.from(secret).toString('hex'), derivationPath)
  }

  private async createSS58KeyPairFromMnemonic(mnemonic: string, password?: string, derivationPath?: string): Promise<KeyPair> {
    await waitReady()
    const secret = bip39ToMiniSecret(mnemonic, password || '')

    return this.createSS58KeyPairFromHexSecret(Buffer.from(secret).toString('hex'), derivationPath)
  }

  private async createKeyPairFromHexSecret(secret: string, derivationPath?: string): Promise<KeyPair> {
    switch (this.configuration.account.type) {
      case 'eth':
        return this.createEthKeyPairFromHexSecret(secret, derivationPath)
      case 'ss58':
        return this.createSS58KeyPairFromHexSecret(secret, derivationPath)
      default:
        assertNever(this.configuration.account)
        throw new UnsupportedError(Domain.SUBSTRATE, 'Unknown account configuration type')
    }
  }

  private createEthKeyPairFromHexSecret(secret: string, derivationPath?: string): KeyPair {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, bitcoinJS.networks.bitcoin)
    const hdNode = ethereumNode.derivePath(derivationPath)

    return {
      secretKey: newSecretKey(hdNode.keyPair.getPrivateKeyBuffer().toString('hex'), 'hex'),
      publicKey: newPublicKey(hdNode.neutered().getPublicKeyBuffer().toString('hex'), 'hex')
    }
  }

  private async createSS58KeyPairFromHexSecret(secret: string, derivationPath?: string): Promise<KeyPair> {
    const { privateKey: secretKey, publicKey }: RawKeyPair = await createSr25519KeyPair(secret, derivationPath)

    return {
      secretKey: newSecretKey(secretKey.toString('hex'), 'hex'),
      publicKey: newPublicKey(publicKey.toString('hex'), 'hex')
    }
  }

  public createAddressFromPublicKey(publicKey: PublicKey): TypedSubstrateAddress<C> {
    return this.substrateAddressFrom(publicKey)
  }

  public async getBalance(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): Promise<SubstrateAccountBalance> {
    const [accountInfo, existentialDeposit]: [SubstrateAccountInfo | undefined, BigNumber | undefined] = await Promise.all([
      this.nodeClient.getAccountInfo(this.substrateAddressFrom(accountId)),
      this.nodeClient.getExistentialDeposit()
    ])

    const balance: SubstrateAccountBalance = {
      total: new BigNumber(0),
      existentialDeposit: existentialDeposit ?? new BigNumber(0),
      transferable: new BigNumber(0),
      transferableCoveringFees: new BigNumber(0)
    }

    if (accountInfo === undefined) {
      return balance
    }

    return {
      ...balance,
      total: accountInfo.data.free.value.plus(accountInfo.data.reserved.value),
      transferable: accountInfo.data.free.value.minus(accountInfo.data.miscFrozen.value),
      transferableCoveringFees: accountInfo.data.free.value.minus(accountInfo.data.feeFrozen.value)
    }
  }

  protected substrateAddressFrom(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): TypedSubstrateAddress<C> {
    return substrateAddressFactory(this.configuration).from(accountId)
  }
}
