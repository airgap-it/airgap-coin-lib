var EC = require('elliptic').ec

export class XrpKeyPair {
  private _pubkey: String
  private _privateKeyHex: String

  constructor(privateKeyHex: string) {
    this._privateKeyHex = privateKeyHex
    let ec = new EC('secp256k1')

    let key = ec.keyFromPrivate(this._privateKeyHex)
    let pubKey = key.getPublic().encodeCompressed()
    this._pubkey = this.bytesToHex(pubKey)
  }

  bytesToHex(a): String {
    return a
      .map(function(byteValue) {
        const hex = byteValue.toString(16).toUpperCase()
        return hex.length > 1 ? hex : '0' + hex
      })
      .join('')
  }

  public toHexPrivateKey(preceedWithZeroes: boolean = true): String {
    if (preceedWithZeroes) {
      return '00' + this._privateKeyHex
    }

    return this._privateKeyHex
  }

  public toHexPubKey(): String {
    return this._pubkey
  }
}
