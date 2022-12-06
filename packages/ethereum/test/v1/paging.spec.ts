import { SubProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { createERC20Token } from '../../src/v1'

import { TestProtocolSpec } from './implementations'
// tslint:disable-next-line: ordered-imports
import { ERC20TokenTestProtocolSpec } from './specs/erc20-token'
import { EthereumTestProtocolSpec } from './specs/ethereum'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const token = createERC20Token({
  name: 'Unknown Ethereum ERC20-Token',
  identifier: SubProtocolSymbols.ETH_ERC20,
  symbol: 'ETH-ERC20',
  marketSymbol: 'erc20',
  contractAddress: '0xB4272071eCAdd69d933AdcD19cA99fe80664fc08',
  decimals: 18
})

const protocols: TestProtocolSpec<string>[] = [
  new EthereumTestProtocolSpec(),
  new ERC20TokenTestProtocolSpec(['0xfd9eeCb127677B1f931D6d49Dfe6626Ffe60370f'], token)
]

protocols.forEach(async (protocol: TestProtocolSpec<string>) => {
  describe(`Transaction Paging`, () => {
    afterEach(async () => {
      sinon.restore()
    })

    it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
      const address = protocol.validAddresses[0]
      const mockTransactions = protocol.transactionList(address)

      await protocol.stub.transactionListStub(protocol, address)

      const firstTransactions = await protocol.lib.getTransactionsForAddress(address, mockTransactions.first.result.length)
      const nextTransactions = await protocol.lib.getTransactionsForAddress(
        address,
        mockTransactions.next.result.length + 1,
        firstTransactions.cursor
      )

      expect(firstTransactions.transactions.length).to.be.eq(mockTransactions.first.result.length)
      expect(firstTransactions.cursor.hasNext).to.be.true
      expect(firstTransactions.cursor.page).to.eq(2)

      expect(nextTransactions.transactions.length).to.be.eq(mockTransactions.next.result.length)
      expect(nextTransactions.cursor.hasNext).to.be.false
      expect(nextTransactions.cursor.page).to.be.undefined
    })
  })
})
