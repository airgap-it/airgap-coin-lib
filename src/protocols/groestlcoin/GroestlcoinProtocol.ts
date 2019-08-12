import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as bitGoUTXO from 'bitgo-utxo-lib'

import { BitcoinBlockbookProtocol } from '../bitcoin/BitcoinBlockbookProtocol'

export class GroestlcoinProtocol extends BitcoinBlockbookProtocol {
  public symbol = 'GRS'
  public name = 'Groestlcoin'
  public marketSymbol = 'grs'

  public feeSymbol = 'grs'

  public feeDefaults = {
    low: new BigNumber('0.00002'),
    medium: new BigNumber('0.00004'),
    high: new BigNumber('0.00005')
  }
  public decimals = 8
  public feeDecimals = 8
  public identifier = 'grs'
  public units = [
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

  public supportsHD = true

  public standardDerivationPath = `m/44'/17'/0'`
  public addressValidationPattern = '^([F3][a-km-zA-HJ-NP-Z1-9]{33}|grs1[a-zA-HJ-NP-Z0-9]{39})$'
  public addressPlaceholder = 'Fdb...'

  public blockExplorer = 'https://chainz.cryptoid.info/grs/'

  constructor() {
    super(bitGoUTXO.networks.groestlcoin, 'https://blockbook.groestlcoin.org', bitGoUTXO)
  }

  public getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/address.dws?{{address}}.htm`.replace('{{address}}', address)
  }

  public getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/tx.dws?{{txId}}.htm`.replace('{{txId}}', txId)
  }
}
