import * as bitcoinJS from 'bitgo-utxo-lib'

import { BitcoinProtocol } from './BitcoinProtocol'

export class BitcoinTestnetProtocol extends BitcoinProtocol {
  public name = 'Bitcoin Testnet'

  public standardDerivationPath = `m/44'/1'/0'`
  public addressValidationPattern = '^..[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'

  constructor() {
    super(bitcoinJS.networks.testnet, 'https://test-insight.bitpay.com')
  }
}
