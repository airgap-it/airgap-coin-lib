var createHash = require('../../create-hash-1.2.0/browser')
var groestlhash = require('../../groestl-hash-js-ef6a04f1c4d2f0448f0882b5f213ef7a0659baee/index')
var crypto = require('crypto')

function ripemd160 (buffer) {
  var hash = 'rmd160'
  var supportedHashes = crypto.getHashes()
  // some environments (electron) only support the long alias
  if (supportedHashes.indexOf(hash) === -1 && supportedHashes.indexOf('ripemd160') !== -1) {
    hash = 'ripemd160'
  }

  return createHash(hash).update(buffer).digest()
}

function sha1 (buffer) {
  return createHash('sha1').update(buffer).digest()
}

function sha256 (buffer) {
  return createHash('sha256').update(buffer).digest()
}

function hash160 (buffer) {
  return ripemd160(sha256(buffer))
}

function hash256 (buffer) {
  return sha256(sha256(buffer))
}

function groestl (buffer) {
  return Buffer(groestlhash.groestl_2(buffer, 1, 1))
}

module.exports = {
  hash160: hash160,
  hash256: hash256,
  ripemd160: ripemd160,
  sha1: sha1,
  sha256: sha256,
  groestl: groestl
}
