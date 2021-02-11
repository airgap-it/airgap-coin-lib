'use strict'

var createHash = require('create-hash')
var bs58grscheckBase = require('./base')
var groestlhash = require('groestl-hash-js')

// GROESTL512(GROESTL512(buffer))
function groestl (buffer) {
  return Buffer(groestlhash.groestl_2(buffer, 1, 1))
}

module.exports = bs58grscheckBase(groestl)
