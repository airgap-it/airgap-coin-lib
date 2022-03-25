import { SubstrateAddress } from '../common/data/account/SubstrateAddress'
import { SubstrateAccountId } from '../compat/SubstrateCompatAddress'

export class AstarAddress extends SubstrateAddress {
  public static getPlaceholder(): AstarAddress {
    return SubstrateAddress.createPlaceholder()
  }

  public static from(accountId: SubstrateAccountId<AstarAddress>): AstarAddress {
    return SubstrateAddress.from(accountId, 5)
  }
}
