import * as bitcoinJS from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'

import { BitcoinProtocol } from './BitcoinProtocol'

export class BitcoinTestnetProtocol extends BitcoinProtocol {
  public name = 'Bitcoin Testnet'

  public standardDerivationPath = `m/44'/1'/0'`
  public addressValidationPattern = '^..[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'

  constructor() {
    super({ network: bitcoinJS.networks.testnet, baseApiUrl: 'https://test-insight.bitpay.com' })
  }
}
