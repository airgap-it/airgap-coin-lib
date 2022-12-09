import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { KusamaTestProtocolSpec } from './specs/kusama'
import { PolkadotTestProtocolSpec } from './specs/polkadot'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols: TestProtocolSpec<string>[] = [new KusamaTestProtocolSpec(), new PolkadotTestProtocolSpec()]

protocols.forEach(async (protocol: TestProtocolSpec<string>) => {
  describe(`Transaction Paging`, () => {
    afterEach(async () => {
      sinon.restore()
    })

    it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
      const address = protocol.validAddresses[0]
      const mockTransactions = protocol.transactionList(address)

      await protocol.stub.transactionListStub(protocol, address)

      const firstTransactions = await protocol.lib.getTransactionsForAddress(
        address,
        mockTransactions.first.transfers.data.transfers.length
      )
      const nextTransactions = await protocol.lib.getTransactionsForAddress(
        address,
        mockTransactions.next.transfers.data.transfers.length + mockTransactions.next.rewardSlash.data.list.length + 1,
        firstTransactions.cursor
      )

      expect(firstTransactions.transactions.length).to.be.eq(
        mockTransactions.first.transfers.data.transfers.length + mockTransactions.first.rewardSlash.data.list.length
      )
      expect(firstTransactions.cursor.hasNext).to.be.true
      expect(firstTransactions.cursor.page).to.eq(1)

      expect(nextTransactions.transactions.length).to.be.eq(
        mockTransactions.next.transfers.data.transfers.length + mockTransactions.next.rewardSlash.data.list.length
      )
      expect(nextTransactions.cursor.hasNext).to.be.false
      expect(nextTransactions.cursor.page).to.be.undefined
    })
  })
})
