import { GroestlcoinProtocolSpec } from './specs/groestl'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as sinon from 'sinon'

import { TestProtocolSpec } from './implementations'
import { AETestProtocolSpec } from './specs/ae'
import { BitcoinProtocolSpec } from './specs/bitcoin'
import { CosmosTestProtocolSpec } from './specs/cosmos'
import { EthereumTestProtocolSpec } from './specs/ethereum'

import { GenericERC20TokenTestProtocolSpec } from './specs/generic-erc20-token'
import { TezosTestProtocolSpec } from './specs/tezos'
import { KusamaTestProtocolSpec } from './specs/kusama'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [
  new CosmosTestProtocolSpec(),
  new EthereumTestProtocolSpec(),
  new AETestProtocolSpec(),
  new TezosTestProtocolSpec(),
  new BitcoinProtocolSpec(),
  new GenericERC20TokenTestProtocolSpec(),
  new GroestlcoinProtocolSpec(),
  new KusamaTestProtocolSpec()
]

protocols.forEach(async (protocol: TestProtocolSpec) => {
  describe(`Transaction Paging`, () => {
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
