'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value)
            }).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function() {
          return this
        }),
      g
    )
    function verb(n) {
      return function(v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var bignumber_js_1 = require('bignumber.js')
var nacl = require('tweetnacl')
var hd_wallet_1 = require('@aeternity/hd-wallet')
var axios_1 = require('axios')
var rlp = require('rlp')
var bs58check = require('bs58check')
var AEProtocol = /** @class */ (function() {
  function AEProtocol(epochRPC) {
    if (epochRPC === void 0) {
      epochRPC = 'https://sdk-edgenet.aepps.com'
    }
    this.epochRPC = epochRPC
    this.symbol = 'AE'
    this.name = 'Aeternity'
    this.feeSymbol = 'ae'
    this.decimals = 18
    this.feeDecimals = 18
    this.identifier = 'ae'
    this.feeDefaults = {
      low: new bignumber_js_1.default('0.00021'),
      medium: new bignumber_js_1.default('0.000315'),
      high: new bignumber_js_1.default('0.00084') // 21000 Gas * 40 Gwei
    }
    this.units = [
      {
        unitSymbol: 'AE',
        factor: new bignumber_js_1.default(1)
      }
    ]
    this.supportsHD = false
    this.standardDerivationPath = 'm/44h/457h'
    this.addressValidationPattern = '^ak_+[1-9A-Za-z][^OIl]{48}$'
  }
  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  AEProtocol.prototype.getPublicKeyFromHexSecret = function(secret, derivationPath) {
    var publicKey = hd_wallet_1.getHDWalletAccounts(hd_wallet_1.generateHDWallet(secret), 1)[0].publicKey
    return Buffer.from(publicKey).toString('hex')
  }
  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  AEProtocol.prototype.getPrivateKeyFromHexSecret = function(secret, derivationPath) {
    var secretKey = hd_wallet_1.getHDWalletAccounts(hd_wallet_1.generateHDWallet(secret), 1)[0].secretKey
    return Buffer.from(secretKey)
  }
  /**
   * Currently, the AE Address is just the Public Key. Address Format tbd
   */
  AEProtocol.prototype.getAddressFromPublicKey = function(publicKey) {
    var base58 = bs58check.encode(Buffer.from(publicKey, 'hex'))
    return 'ak_' + base58
  }
  AEProtocol.prototype.getTransactionsFromPublicKey = function(publicKey, limit, offset) {
    return Promise.resolve([{}])
  }
  AEProtocol.prototype.getTransactionsFromAddresses = function(addresses, limit, offset) {
    return Promise.resolve([{}])
  }
  AEProtocol.prototype.signWithPrivateKey = function(privateKey, transaction) {
    // sign and cut off first byte ('ae')
    var rawTx = bs58check.decode(transaction.slice(3))
    var signature = nacl.sign.detached(rawTx, privateKey)
    var txObj = {
      tag: Buffer.from([11]),
      version: Buffer.from([1]),
      signatures: [Buffer.from(signature)],
      transaction: rawTx
    }
    var txArray = Object.keys(txObj).map(function(a) {
      return txObj[a]
    })
    var rlpEncodedTx = rlp.encode(txArray)
    var signedEncodedTx = 'tx_' + bs58check.encode(rlpEncodedTx)
    return Promise.resolve(signedEncodedTx)
  }
  AEProtocol.prototype.getTransactionDetails = function(transaction) {
    var rlpEncodedTx = bs58check.decode(transaction, 'hex')
    var rlpDecodedTx = rlp.decode(rlpEncodedTx.slice(0, rlp.getLength(rlpEncodedTx)))
    var airgapTx = {
      amount: new bignumber_js_1.default(parseInt(rlpDecodedTx[4].toString('hex'), 16)),
      fee: new bignumber_js_1.default(parseInt(rlpDecodedTx[5].toString('hex'), 16)),
      from: [rlpDecodedTx[2].toString('hex')],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [rlpDecodedTx[3].toString('hex')]
    }
    return airgapTx
  }
  AEProtocol.prototype.getTransactionDetailsFromRaw = function(transaction, rawTx) {
    var rlpEncodedTawTx = bs58check.decode(rawTx, 'hex')
    var rlpDecodedRawTx = rlp.decode(rlpEncodedTawTx.slice(0, rlp.getLength(rlpEncodedTawTx)))
    return this.getTransactionDetails(rlpDecodedRawTx[3])
  }
  AEProtocol.prototype.getBalanceOfAddresses = function(addresses) {
    return __awaiter(this, void 0, void 0, function() {
      var balance
      var _this = this
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            balance = new bignumber_js_1.default(0)
            return [
              4 /*yield*/,
              Promise.all(
                addresses.map(function(address) {
                  return __awaiter(_this, void 0, void 0, function() {
                    var data
                    return __generator(this, function(_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, axios_1.default.get(this.epochRPC + '/v2/accounts/' + address)]
                        case 1:
                          data = _a.sent().data
                          balance.plus(new bignumber_js_1.default(data.balance))
                          return [2 /*return*/]
                      }
                    })
                  })
                })
              )
            ]
          case 1:
            _a.sent()
            return [2 /*return*/, balance]
        }
      })
    })
  }
  AEProtocol.prototype.getBalanceOfPublicKey = function(publicKey) {
    var address = this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }
  AEProtocol.prototype.prepareTransactionFromPublicKey = function(publicKey, recipients, values, fee) {
    var _this = this
    return new Promise(function(resolve, reject) {
      axios_1.default
        .get(_this.epochRPC + '/v2/accounts/' + _this.getAddressFromPublicKey(publicKey))
        .then(function(_a) {
          var data = _a.data
          var sender = publicKey
          var recipient = bs58check.decode(recipients[0].replace('ak_', ''))
          var txObj = {
            tag: Buffer.from([12]),
            version: Buffer.from([1]),
            sender_id: Buffer.concat([Buffer.from([1]), Buffer.from(sender, 'hex')]),
            recipient_id: Buffer.concat([Buffer.from([1]), recipient]),
            amount: Buffer.from([values[0].toNumber()]),
            fee: Buffer.from([fee.toNumber()]),
            ttl: Buffer.from([60]),
            nonce: Buffer.from([data.nonce + 1]),
            payload: Buffer.from('')
          }
          var txArray = Object.keys(txObj).map(function(a) {
            return txObj[a]
          })
          var rlpEncodedTx = rlp.encode(txArray)
          var preparedTx = 'tx_' + bs58check.encode(rlpEncodedTx)
          resolve(preparedTx)
        })
        .catch(reject)
    })
  }
  AEProtocol.prototype.broadcastTransaction = function(rawTransaction) {
    return __awaiter(this, void 0, void 0, function() {
      var data
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, axios_1.default.post(this.epochRPC + '/v2/transactions', { tx: rawTransaction })]
          case 1:
            data = _a.sent().data
            return [2 /*return*/, Promise.resolve(data)]
        }
      })
    })
  }
  // Unsupported Functionality for Aeternity
  AEProtocol.prototype.getExtendedPrivateKeyFromHexSecret = function(secret, derivationPath) {
    throw new Error('extended private key support for aeternity not implemented')
  }
  AEProtocol.prototype.getBalanceOfExtendedPublicKey = function(extendedPublicKey, offset) {
    return Promise.reject('extended public balance for aeternity not implemented')
  }
  AEProtocol.prototype.signWithExtendedPrivateKey = function(extendedPrivateKey, transaction) {
    return Promise.reject('extended private key signing for aeternity not implemented')
  }
  AEProtocol.prototype.getAddressFromExtendedPublicKey = function(extendedPublicKey, visibilityDerivationIndex, addressDerivationIndex) {
    return ''
  }
  AEProtocol.prototype.getAddressesFromExtendedPublicKey = function(extendedPublicKey, visibilityDerivationIndex, addressCount, offset) {
    return []
  }
  AEProtocol.prototype.getTransactionsFromExtendedPublicKey = function(extendedPublicKey, limit, offset) {
    return Promise.resolve([{}])
  }
  AEProtocol.prototype.prepareTransactionFromExtendedPublicKey = function(extendedPublicKey, offset, recipients, values, fee) {
    return Promise.reject('extended public tx for aeternity not implemented')
  }
  return AEProtocol
})()
exports.AEProtocol = AEProtocol
