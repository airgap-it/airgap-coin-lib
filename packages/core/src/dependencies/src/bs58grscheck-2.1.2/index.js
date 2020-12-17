'use strict'

var createHash = require('../create-hash-1.2.0/browser')
var bs58grscheckBase = require('./base')
var groestlhash = require('../groestl-hash-js-ef6a04f1c4d2f0448f0882b5f213ef7a0659baee/index')

// GROESTL512(GROESTL512(buffer))
function groestl (buffer) {
  return Buffer(groestlhash.groestl_2(buffer, 1, 1))
}

module.exports = bs58grscheckBase(groestl)
