import * as bitcoinJS from 'bitcoinjs-lib'

import { BitcoinProtocol } from './BitcoinProtocol'

export class BitcoinTestnetProtocol extends BitcoinProtocol {
  name = 'Bitcoin Testnet'

  standardDerivationPath = `m/44'/1'/0'`
  addressValidationPattern = '^..[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'

  constructor() {
    super(bitcoinJS.networks.testnet, 'https://test-insight.bitpay.com')
  }
}
