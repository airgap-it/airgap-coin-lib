// // tslint:disable: no-floating-promises
// import chai = require('chai')
// import chaiAsPromised = require('chai-as-promised')
// import 'mocha'
// import sinon = require('sinon')

// import { TestProtocolSpec } from './implementations'
// import { ICPTestProtocolSpec } from './specs/icp'

// // use chai-as-promised plugin
// chai.use(chaiAsPromised)
// const expect = chai.expect

// const protocols: [TestProtocolSpec] = [new ICPTestProtocolSpec()]

// protocols.map((protocol: TestProtocolSpec) => {
//   describe(`Transaction Paging`, () => {
//     afterEach(() => {
//       sinon.restore()
//     })

//     it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
//       const address = protocol.validAddresses[0]
//       const mockTransactions = protocol.transactionList(address)

//       await protocol.stub.transactionListStub(protocol, address)

//       const firstTransactions = await protocol.lib.getTransactionsForAddress(address, mockTransactions.first.blocks.length)
//       const nextTransactions = await protocol.lib.getTransactionsForAddress(
//         address,
//         mockTransactions.next.blocks.length,
//         firstTransactions.cursor
//       )

//       expect(firstTransactions.transactions.length).to.be.eq(mockTransactions.first.blocks.length)
//       expect(firstTransactions.cursor.hasNext).to.be.true
//       expect(firstTransactions.cursor.next).to.be.eq(mockTransactions.first.next)

//       expect(nextTransactions.transactions.length).to.be.eq(mockTransactions.next.blocks.length)
//       expect(nextTransactions.cursor.hasNext).to.be.false
//       expect(nextTransactions.cursor.next).to.be.undefined
//     })
//   })
// })
