import { SubstrateAddress } from '../common/data/account/SubstrateAddress'
import { SubstrateAccountId } from '../compat/SubstrateCompatAddress'

export class PolkadotAddress extends SubstrateAddress {
  public static getPlaceholder(): PolkadotAddress {
    return SubstrateAddress.createPlaceholder()
  }

  public static from(accountId: SubstrateAccountId<PolkadotAddress>): PolkadotAddress {
    return SubstrateAddress.from(accountId, 0)
  }
}