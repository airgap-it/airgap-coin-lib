import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')
import { TestProtocolSpec } from './implementations'
import { GroestlcoinProtocolSpec } from './specs/groestl'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new GroestlcoinProtocolSpec()]

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    describe(`Transaction Paging`, () => {
      beforeEach(async () => {
        sinon
          .stub(protocol.lib, 'getTransactionsFromAddresses')
          .onFirstCall()
          .returns(protocol.transactionResult)
          .onSecondCall()
          .returns(protocol.nextTransactionResult)
      })

      afterEach(async () => {
        sinon.restore()
      })

      it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
        const limit = 2
        const address = protocol.validAddresses[0]
        const transactionResult = await protocol.lib.getTransactionsFromAddresses([address], limit)
        const nextTransactions = await protocol.lib.getTransactionsFromAddresses([address], limit, transactionResult.cursor)

        expect(transactionResult.transactions.length).to.be.eq(limit)
        expect(nextTransactions.transactions.length).to.be.eq(limit)
        expect(nextTransactions.transactions.map((tx) => tx.hash).length).to.be.eq(limit)
        expect(nextTransactions.transactions.map((tx) => tx.hash).length).to.be.eq(limit)

        expect(transactionResult.transactions[0].hash).not.to.eq(nextTransactions.transactions[0].hash)
      })
    })
  })
).then(() => {
  run()
})
