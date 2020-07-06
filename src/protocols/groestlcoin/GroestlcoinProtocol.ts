import * as groestlcoinJSMessage from 'groestlcoinjs-message'
import * as bitGoUTXO from '../../dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { BitcoinBlockbookProtocol } from '../bitcoin/BitcoinBlockbookProtocol'
import { CurrencyUnit, FeeDefaults } from '../ICoinProtocol'
import { BitcoinCryptoClient } from '../bitcoin/BitcoinCryptoClient'

export class GroestlcoinProtocol extends BitcoinBlockbookProtocol {
  public symbol: string = 'GRS'
  public name: string = 'Groestlcoin'
  public marketSymbol: string = 'grs'

  public feeSymbol: string = 'grs'

  public feeDefaults: FeeDefaults = {
    low: '0.00002',
    medium: '0.00004',
    high: '0.00005'
  }
  public decimals: number = 8
  public feeDecimals: number = 8
  public identifier: string = 'grs'
  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'GRS',
      factor: '1'
    },
    {
      unitSymbol: 'mGRS',
      factor: '0.0001'
    },
    {
      unitSymbol: 'Satoshi',
      factor: '0.00000001'
    }
  ]

  public supportsHD: boolean = true

  public standardDerivationPath: string = `m/44'/17'/0'`
  public addressValidationPattern: string = '^([F3][a-km-zA-HJ-NP-Z1-9]{33}|grs1[a-zA-HJ-NP-Z0-9]{39})$'
  public addressPlaceholder: string = 'Fdb...'

  public blockExplorer: string = 'https://chainz.cryptoid.info/grs'

  constructor() {
    super(bitGoUTXO.networks.groestlcoin, 'https://blockbook.groestlcoin.org', bitGoUTXO)
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return `${this.blockExplorer}/address.dws?{{address}}.htm`.replace('{{address}}', address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return `${this.blockExplorer}/tx.dws?{{txId}}.htm`.replace('{{txId}}', txId)
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    return new BitcoinCryptoClient(this, groestlcoinJSMessage).signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return new BitcoinCryptoClient(this, groestlcoinJSMessage).verifyMessage(message, signature, publicKey)
  }
}
