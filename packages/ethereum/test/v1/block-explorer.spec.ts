// tslint:disable no-floating-promises
import { AirGapBlockExplorer } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'

import { EtherscanBlockExplorer } from '../../src/v1'
import { ETHEREUM_MAINNET_PROTOCOL_NETWORK } from '../../src/v1/protocol/EthereumProtocol'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const blockExplorers: AirGapBlockExplorer[] = [new EtherscanBlockExplorer(ETHEREUM_MAINNET_PROTOCOL_NETWORK.blockExplorerApi)]

Promise.all(
  blockExplorers.map(async (blockExplorer: AirGapBlockExplorer) => {
    const blockExplorerMetadata = await blockExplorer.getMetadata()

    const address = 'dummyAddress'
    const txId = 'dummyTxId'

    const addressUrl = await blockExplorer.createAddressUrl(address)
    const transactionUrl = await blockExplorer.createTransactionUrl(txId)

    describe(`Block Explorer ${blockExplorerMetadata.name}`, () => {
      it('should replace address', async () => {
        expect(addressUrl).to.contain(address)
      })

      it('should replace txId', async () => {
        expect(transactionUrl).to.contain(txId)
      })

      it('should contain blockexplorer url', async () => {
        expect(addressUrl).to.contain(blockExplorerMetadata.url)
        expect(transactionUrl).to.contain(blockExplorerMetadata.url)
      })

      it('should not contain placeholder brackets', async () => {
        // Placeholders should be replaced
        expect(addressUrl).to.not.contain('{{')
        expect(addressUrl).to.not.contain('}}')
        expect(transactionUrl).to.not.contain('{{')
        expect(transactionUrl).to.not.contain('}}')
      })

      it('should always use https://', async () => {
        expect(addressUrl).to.not.contain('http://')
        expect(transactionUrl).to.not.contain('http://')
        expect(addressUrl).to.contain('https://')
        expect(transactionUrl).to.contain('https://')
      })

      it('should never contain 2 / after each other', async () => {
        // We remove "https://" so we can check if the rest of the url contains "//"
        expect(addressUrl.split('https://').join('')).to.not.contain('//')
        expect(transactionUrl.split('https://').join('')).to.not.contain('//')
      })
    })
  })
).then(() => {
  run()
})
