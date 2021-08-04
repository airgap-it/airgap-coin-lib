import { SubstrateAddress } from '../common/data/account/SubstrateAddress'
import { SubstrateAccountId } from '../compat/SubstrateCompatAddress'

export class KusamaAddress extends SubstrateAddress {
  public static getPlaceholder(): KusamaAddress {
    return SubstrateAddress.createPlaceholder()
  }

  public static from(accountId: SubstrateAccountId<KusamaAddress>): KusamaAddress {
    return SubstrateAddress.from(accountId, 2)
  }
}
