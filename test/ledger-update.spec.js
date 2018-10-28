const CoinLib = require('../dist/index')
const chai = require('chai')
const expect = chai.expect

describe('OnLedgerUpdate listeners test', function() {
  /*  it('should fire OnLedgerUpdate for Ethereum ', function(done) {
    const ethereum = new CoinLib.EthereumProtocol()
    ethereum.onLedgerUpdateListeners.push({
      onNewTransactions: function(transactions) {
        expect(transactions.length).to.be.greaterThan(0)
        ethereum.stopLedgerWatcher()
        done()
      }
    })
    ethereum.startLedgerWatcher()
  }).timeout(60000)

  it('should fire OnLedgerUpdate for GenericERC20', function(done) {
    const genericERC20 = new CoinLib.GenericERC20('0xd26114cd6EE289AccF82350c8d8487fedB8A0C07')
    genericERC20.onLedgerUpdateListeners.push({
      onNewTransactions: function(transactions) {
        expect(transactions.length).to.be.greaterThan(0)
        genericERC20.stopLedgerWatcher()
        done()
      }
    })
    genericERC20.startLedgerWatcher()
  }).timeout(600000)*/

  /*  it('should fire OnLedgerUpdate for Aeternity', function(done) {
    const aeProtocol = new CoinLib.AEProtocol()
    aeProtocol.onLedgerUpdateListeners.push({
      onNewTransactions: function(transactions) {
        expect(transactions.length).to.be.greaterThan(0)
        aeProtocol.stopLedgerWatcher()
        done()
      }
    })
    aeProtocol.startLedgerWatcher()
  }).timeout(600000)*/

  it('should fire OnLedgerUpdate for Bitcoin', function(done) {
    const bitcoin = new CoinLib.BitcoinProtocol()
    bitcoin.onLedgerUpdateListeners.push({
      onNewTransactions: function(transactions) {
        console.log(transactions)
        done()
      }
    })
    bitcoin.startLedgerWatcher()
  }).timeout(600000)
})
