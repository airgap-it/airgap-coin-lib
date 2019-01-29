import { TezosProtocol } from '../TezosProtocol'
import { SubProtocolType, ICoinSubProtocol } from '../../ICoinSubProtocol'

export interface TezosKtConfiguration {
  address: string
}

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  isSubProtocol = true
  subProtocolType = SubProtocolType.ACCOUNT
  subProtocolConfiguration: TezosKtConfiguration

  addressValidationPattern = '^KT1[1-9A-Za-z]{33}$'

  constructor(config: TezosKtConfiguration) {
    super('https://tezrpc.me/alphanet', 'https://test-insight.bitpay.com')
    this.subProtocolConfiguration = config
  }

  getAddressFromPublicKey(publicKey: string): string {
    return this.subProtocolConfiguration.address
  }

  static originate() {
    //
  }

  delegate() {
    //
  }
}
