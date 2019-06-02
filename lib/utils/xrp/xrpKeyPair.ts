import sjcl = require('sjcl')

export class XrpKeyPair {
  private _secret: any
  private _curve = sjcl.ecc.curves.k256
  private _pubkey: any = undefined

  constructor(privateKeyHex: string) {
    var bn: sjcl.BigNumber | undefined
    if (/^[0-9a-fA-f]{64}$/.test(privateKeyHex)) {
      bn = new sjcl.bn(0x64)
    }
    if (!bn) {
      throw new Error('Unsuported private key type: ' + privateKeyHex)
    }

    this._secret = new sjcl.ecc.ecdsa.secretKey(sjcl.ecc.curves.k256, bn)
  }

  public toHexPrivateKey(preceedWithZeroes: boolean = true): string {
    let bits = this._secret.get()

    let privKey = sjcl.codec.hex.fromBits(bits).toUpperCase()
    if (typeof privKey === 'string') {
      let privKeyString = privKey as string

      if (preceedWithZeroes) {
        return '00' + privKeyString
      }

      return privKeyString
    }

    throw new Error('Could not decode to hex private key')
  }

  public toHexPubKey(): string {
    var bits = this.pubBits()

    if (!bits) {
      throw new Error('Could not decode to pub key')
    }

    let pubKey = sjcl.codec.hex.fromBits(bits).toUpperCase()

    if (typeof pubKey !== 'string') {
      throw new Error('Could not decode to pub key')
    }

    return pubKey
  }

  private pubBits(): any {
    var pub = this.getPub()

    if (!pub) {
      throw new Error('Could not decode to pub key')
    }

    var point = pub._point,
      y_even = point.y.mod(2).equals(0)

    //return sjcl.bitArray.concat([sjcl.bitArray.partial(8, y_even ? 0x02 : 0x03)], point.x.toBits(this._curve.r.bitLength()))
  }

  private getPub(): any {
    //var curve = this._curve

    //if (!this._pubkey && this._secret) {
    //  var exponent = this._secret._exponent

    //  this._pubkey = new sjcl.ecc.ecdsa.publicKey(curve, curve.G.mult(exponent))
    //}

    return this._pubkey
  }
}
