import * as BIP39 from 'bip39'
import { BitcoinProtocol } from '../bitcoin/BitcoinProtocol'
import * as bitGoUTXO from 'bitgo-utxo-lib'
import BigNumber from 'bignumber.js'

export class GroestlcoinProtocol extends BitcoinProtocol {
  symbol = 'GRS'
  name = 'Groestlcoin'
  marketSymbol = 'grs'

  feeSymbol = 'grs'

  feeDefaults = {
    low: new BigNumber('0.00002'),
    medium: new BigNumber('0.00004'),
    high: new BigNumber('0.00005')
  }
  decimals = 8
  feeDecimals = 8
  identifier = 'grs'
  units = [
    {
      unitSymbol: 'GRS',
      factor: new BigNumber(1)
    },
    {
      unitSymbol: 'mGRS',
      factor: new BigNumber(1).shiftedBy(-4)
    },
    {
      unitSymbol: 'Satoshi',
      factor: new BigNumber(1).shiftedBy(-8)
    }
  ]

  supportsHD = true

  standardDerivationPath = `m/44'/17'/0'`
  addressValidationPattern = '^[F][a-km-zA-HJ-NP-Z1-9]{25,34}$'
  addressPlaceholder = '1ABC...'

  constructor() {
    super(bitGoUTXO.networks.groestlcoin, 'https://blockbook.groestlcoin.org', bitGoUTXO)
  }
}
