import { KeyPair, PublicKey, Secret } from '@airgap/module-kit'
import { SubstrateAccountId } from '../../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountBalance } from '../../data/account/SubstrateAccountBalance'
import { SubstrateProtocolConfiguration } from '../../types/configuration'

export interface SubstrateAccountController<C extends SubstrateProtocolConfiguration> {
  createKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair>
  createAddressFromPublicKey(publicKey: PublicKey): TypedSubstrateAddress<C>

  getBalance(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): Promise<SubstrateAccountBalance>
}
