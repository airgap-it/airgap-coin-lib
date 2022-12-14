// tslint:disable no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { TezosTestProtocolSpec } from './specs/tezos'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new TezosTestProtocolSpec()]

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec<any>) => {
    describe(`Transaction Paging`, () => {
      afterEach(async () => {
        sinon.restore()
      })

      it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
        const address = protocol.validAddresses[0]
        const mockTransactions = protocol.transactionList(address)

        await protocol.stub.transactionListStub(protocol, address)

        const firstTransactions = await protocol.lib.getTransactionsForAddress(address, mockTransactions.first.length)
        const nextTransactions = await protocol.lib.getTransactionsForAddress(
          address,
          mockTransactions.next.length + 1,
          firstTransactions.cursor
        )

        expect(firstTransactions.transactions.length).to.be.eq(mockTransactions.first.length)
        expect(firstTransactions.cursor.hasNext).to.be.true
        expect(firstTransactions.cursor.offset).to.be.eq(mockTransactions.first.length)

        expect(nextTransactions.transactions.length).to.be.eq(mockTransactions.next.length)
        expect(nextTransactions.cursor.hasNext).to.be.false
        expect(nextTransactions.cursor.offset).to.be.eq(mockTransactions.first.length + mockTransactions.next.length)
      })
    })
  })
).then(() => {
  run()
})
