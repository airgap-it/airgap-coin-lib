var MD5 = require('../md5.js-1.3.5/index')

module.exports = function (buffer) {
  return new MD5().update(buffer).digest()
}
