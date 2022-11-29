// tslint:disable no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { BitcoinProtocolSpec } from './specs/bitcoin'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new BitcoinProtocolSpec()]

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    describe(`Transaction Paging`, () => {
      afterEach(async () => {
        sinon.restore()
      })

      it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
        const publicKey = protocol.wallet.extendedPublicKey
        const mockTransactions = protocol.transactionList(publicKey.value)

        await protocol.stub.transactionListStub(protocol, publicKey.value)

        const firstTransactions = await protocol.lib.getTransactionsForPublicKey(publicKey, mockTransactions.first.itemsOnPage)
        const secondTransactions = await protocol.lib.getTransactionsForPublicKey(
          publicKey,
          mockTransactions.next.itemsOnPage,
          firstTransactions.cursor
        )

        expect(firstTransactions.transactions.length).to.be.eq(mockTransactions.first.transactions?.length ?? 0)
        expect(firstTransactions.cursor.hasNext).to.be.true
        expect(firstTransactions.cursor.page).to.eq(2)

        expect(secondTransactions.transactions.length).to.be.eq(mockTransactions.next.transactions?.length ?? 0)
        expect(secondTransactions.cursor.hasNext).to.be.false
        expect(secondTransactions.cursor.page).to.be.undefined
      })
    })
  })
).then(() => {
  run()
})
