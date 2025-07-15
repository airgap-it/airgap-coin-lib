// tslint:disable: no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { StellarTestProtocolSpec } from './specs/stellar'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols: [TestProtocolSpec] = [new StellarTestProtocolSpec()]

protocols.map((protocol: TestProtocolSpec) => {
  describe(`Transaction Paging`, () => {
    afterEach(() => {
      sinon.restore()
    })

    it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
      const address = protocol.validAddresses[0]
      const mockTransactions = protocol.transactionList(address)

      await protocol.stub.transactionListStub(protocol, address)

      const horizonUrl = (await protocol.lib.getNetwork()).rpcUrl

      const firstTransactions = await protocol.lib.getTransactionsForAddress(address, mockTransactions.first.data._embedded.records.length)

      const nextTransactions = await protocol.lib.getTransactionsForAddress(
        address,
        mockTransactions.first.data._embedded.records.length,
        firstTransactions.cursor
      )
      expect(firstTransactions.transactions.length).to.be.eq(mockTransactions.first.data._embedded.records.length)
      expect(firstTransactions.cursor.hasNext).to.be.true
      expect(`${horizonUrl}${firstTransactions.cursor.next}`).to.be.eq(mockTransactions.first.data._links.next.href)

      expect(nextTransactions.transactions.length).to.be.eq(mockTransactions.next.data._embedded.records.length)
      expect(nextTransactions.cursor.hasNext).to.be.false
      expect(nextTransactions.cursor.next).to.be.undefined
    })
  })
})
