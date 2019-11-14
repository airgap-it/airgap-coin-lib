'use strict'
try {
  module.exports = require('./bindings')
} catch (err) {
  console.log('Keccak bindings are not compiled. Pure JS implementation will be used.')
  module.exports = require('./js')
}
