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
  addressValidationPattern = '^([F3][a-km-zA-HJ-NP-Z1-9]{33}|grs1[a-zA-HJ-NP-Z0-9]{39})$'
  addressPlaceholder = 'Fdb...'

  blockExplorer = 'https://chainz.cryptoid.info/grs/'

  constructor() {
    super(bitGoUTXO.networks.groestlcoin, 'https://blockbook.groestlcoin.org', bitGoUTXO)
  }

  getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/address.dws?{{address}}.htm`.replace('{{address}}', address)
  }

  getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/tx.dws?{{txId}}.htm`.replace('{{txId}}', txId)
  }
}
