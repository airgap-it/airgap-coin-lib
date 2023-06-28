import { assertNever, Domain } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import { fromBase58 } from '@airgap/coinlib-core/dependencies/src/bip32-2.0.4/src/index'
import { InvalidValueError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import { CryptoDerivative, KeyPair, newPublicKey, newSecretKey, PublicKey } from '@airgap/module-kit'

import { SubstrateAccountId } from '../../data/account/address/SubstrateAddress'
import { substrateAddressFactory, TypedSubstrateAddress } from '../../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountBalance } from '../../data/account/SubstrateAccountBalance'
import { SubstrateAccountInfo } from '../../data/account/SubstrateAccountInfo'
import { SubstrateNodeClient } from '../../node/SubstrateNodeClient'
import { SubstrateProtocolConfiguration } from '../../types/configuration'

import { SubstrateAccountController } from './SubstrateAccountController'

export class SubstrateCommonAccountController<C extends SubstrateProtocolConfiguration, NodeClient extends SubstrateNodeClient<C>>
  implements SubstrateAccountController<C>
{
  public constructor(protected readonly configuration: C, protected readonly nodeClient: NodeClient) {}

  public async createKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    switch (this.configuration.account.type) {
      case 'eth':
        return this.createEthKeyPairFromDerivative(derivative)
      case 'ss58':
        return this.createSS58KeyPairFromDerivative(derivative)
      default:
        assertNever(this.configuration.account)
        throw new UnsupportedError(Domain.SUBSTRATE, 'Unknown account configuration type')
    }
  }

  private async createEthKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const bip32Node = encodeDerivative('bip32', derivative)
    const ethNode = fromBase58(bip32Node.secretKey)
    const secretKey = ethNode.privateKey
    if (secretKey === undefined) {
      throw new InvalidValueError(Domain.SUBSTRATE, 'Cannot generate secret key')
    }

    const publicKey = ethNode.publicKey

    return {
      secretKey: newSecretKey(secretKey.toString('hex'), 'hex'),
      publicKey: newPublicKey(publicKey.toString('hex'), 'hex')
    }
  }

  private async createSS58KeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return {
      secretKey: newSecretKey(derivative.secretKey, 'hex'),
      publicKey: newPublicKey(derivative.publicKey, 'hex')
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
      transferable: new BigNumber(0)
    }

    if (accountInfo === undefined) {
      return balance
    }

    const totalBalance = accountInfo.data.free.value.plus(accountInfo.data.reserved.value)
    const transferableBalance = BigNumber.min(accountInfo.data.free.value, totalBalance.minus(accountInfo.data.frozen.value))

    return {
      ...balance,
      total: totalBalance,
      transferable: transferableBalance
    }
  }

  protected substrateAddressFrom(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): TypedSubstrateAddress<C> {
    return substrateAddressFactory(this.configuration).from(accountId)
  }
}
