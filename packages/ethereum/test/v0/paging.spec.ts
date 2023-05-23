import { SubProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolNetwork,
  EthereumProtocolNetworkExtras,
  GenericERC20
} from '../../src/v0'

import { TestProtocolSpec } from './implementations'
import { EthereumTestProtocolSpec } from './specs/ethereum'
import { GenericERC20TokenTestProtocolSpec } from './specs/generic-erc20-token'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const token = new GenericERC20(
  new EthereumERC20ProtocolOptions(
    new EthereumProtocolNetwork(undefined, undefined, undefined, undefined, new EthereumProtocolNetworkExtras(3)),
    new EthereumERC20ProtocolConfig(
      'ETH-ERC20',
      'Unknown Ethereum ERC20-Token',
      'erc20',
      SubProtocolSymbols.ETH_ERC20,
      '0xB4272071eCAdd69d933AdcD19cA99fe80664fc08',
      18
    )
  )
)

const protocols = [
  new EthereumTestProtocolSpec(),
  new GenericERC20TokenTestProtocolSpec(['0xfd9eeCb127677B1f931D6d49Dfe6626Ffe60370f'], token)
]

protocols.forEach(async (protocol: TestProtocolSpec) => {
  describe(`Transaction Paging (v0)`, () => {
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
