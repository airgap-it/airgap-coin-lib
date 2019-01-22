import 'mocha'

import { expect } from 'chai'
import { EthereumProtocol, addSubProtocol, GenericERC20, BitcoinProtocol } from '../../lib'

describe(`SubTokens`, () => {
  it('should be able to add a GenericERC20 Sub-Token to Ethereum', async () => {
    const ethereum = new EthereumProtocol()

    const symbol = 'Test-Symbol'
    const name = 'SuperTestToken'
    const marketSymbol = 'Test-Market-Symbol'
    const identifier = 'eth-erc20-test'

    // no subtokens should be registered by default
    expect(ethereum.subProtocols.length).to.equal(0)

    addSubProtocol(
      ethereum.identifier,
      new GenericERC20(symbol, name, marketSymbol, identifier, '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d')
    )

    // no subtokens should be registered by default
    expect(ethereum.subProtocols.length).to.equal(1)
  })
})
