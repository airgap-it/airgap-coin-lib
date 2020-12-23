const expect = require('chai').expect

module.exports = function(tx) {
  expect(tx.from.length).to.be.above(0)
  expect(tx.to.length).to.be.above(0)
  expect(tx.timestamp).to.be.above(0)
}
