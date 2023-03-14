import { CryptoDerivative, KeyPair, PublicKey } from '@airgap/module-kit'

import { SubstrateAccountId } from '../../data/account/address/SubstrateAddress'
import { TypedSubstrateAddress } from '../../data/account/address/SubstrateAddressFactory'
import { SubstrateAccountBalance } from '../../data/account/SubstrateAccountBalance'
import { SubstrateProtocolConfiguration } from '../../types/configuration'

export interface SubstrateAccountController<C extends SubstrateProtocolConfiguration> {
  createKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair>
  createAddressFromPublicKey(publicKey: PublicKey): TypedSubstrateAddress<C>

  getBalance(accountId: SubstrateAccountId<TypedSubstrateAddress<C>>): Promise<SubstrateAccountBalance>
}
