'use strict'
var inherits = require('../inherits-2.0.4/inherits')
var MD5 = require('../create-hash-1.2.0/md5')
var RIPEMD160 = require('../ripemd160-2.0.2/index')
var sha = require('../sha.js-2.4.11/sha')
var Base = require('../cipher-base-1.0.4/index')

function Hash(hash) {
  Base.call(this, 'digest')

  this._hash = hash
}

inherits(Hash, Base)

Hash.prototype._update = function(data) {
  this._hash.update(data)
}

Hash.prototype._final = function() {
  return this._hash.digest()
}

module.exports = function createHash(alg) {
  alg = alg.toLowerCase()
  if (alg === 'md5') return new MD5()
  if (alg === 'rmd160' || alg === 'ripemd160') return new RIPEMD160()

  return new Hash(sha(alg))
}
