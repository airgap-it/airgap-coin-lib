import { CosmosPagedSendTxsResponse } from '@airgap/cosmos-core'

// tslint:disable no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { CosmosTestProtocolSpec } from './specs/cosmos'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new CosmosTestProtocolSpec()]

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    describe(`Transaction Paging`, () => {
      afterEach(async () => {
        sinon.restore()
      })

      it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
        const limitFromResponse = (transactions: CosmosPagedSendTxsResponse) => {
          return transactions.tx_responses.reduce((acc, next) => acc + next.tx.body.messages.length, 0)
        }

        const limitFromResponseSet = (transactions: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }) => {
          return limitFromResponse(transactions.sender) + limitFromResponse(transactions.recipient)
        }

        const address = protocol.validAddresses[0]
        const mockTransactions = protocol.transactionList(address)

        await protocol.stub.transactionListStub(protocol, address)

        const firstTransactions = await protocol.lib.getTransactionsForAddress(address, limitFromResponseSet(mockTransactions.first))
        const nextTransactions = await protocol.lib.getTransactionsForAddress(
          address,
          limitFromResponseSet(mockTransactions.next),
          firstTransactions.cursor
        )

        expect(firstTransactions.transactions.length).to.be.eq(limitFromResponseSet(mockTransactions.first))
        expect(firstTransactions.cursor.hasNext, 'expected first transaction cursor to have `hasNext: true`').to.be.true
        expect(firstTransactions.cursor.sender.total).to.eq(parseInt(mockTransactions.first.sender.total, 10))
        expect(firstTransactions.cursor.sender.offset).to.eq(mockTransactions.first.sender.txs.length)
        expect(firstTransactions.cursor.recipient.total).to.eq(parseInt(mockTransactions.first.recipient.total, 10))
        expect(firstTransactions.cursor.recipient.offset).to.eq(mockTransactions.first.recipient.txs.length)

        expect(nextTransactions.transactions.length).to.be.eq(limitFromResponseSet(mockTransactions.next))
        expect(nextTransactions.cursor.hasNext, 'expected next transaction cursor to have `hasNext: false`').to.be.false
        expect(nextTransactions.cursor.sender.total).to.eq(parseInt(mockTransactions.next.sender.total, 10))
        expect(nextTransactions.cursor.sender.offset).to.eq(
          mockTransactions.first.sender.txs.length + mockTransactions.next.sender.txs.length
        )
        expect(nextTransactions.cursor.recipient.total).to.eq(parseInt(mockTransactions.next.recipient.total, 10))
        expect(nextTransactions.cursor.recipient.offset).to.eq(
          mockTransactions.first.recipient.txs.length + mockTransactions.next.recipient.txs.length
        )
      })
    })
  })
).then(() => {
  run()
})
