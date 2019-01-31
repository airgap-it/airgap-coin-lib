import 'mocha'

import { expect } from 'chai'
import { EthereumProtocol, addSubProtocol, GenericERC20, GenericERC20Configuration } from '../../lib'

describe(`SubTokens`, () => {
  it('should be able to add a GenericERC20 Sub-Token to Ethereum', async () => {
    const ethereum = new EthereumProtocol()

    const genericConfig: GenericERC20Configuration = {
      symbol: 'Test-Symbol',
      name: 'SuperTestToken',
      marketSymbol: 'test-market-symbol',
      identifier: 'eth-erc20-test',
      contractAddress: '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d',
      decimals: 18
    }

    // no subtokens should be registered by default
    const currentSubtokenLength = ethereum.subProtocols.length

    addSubProtocol(ethereum.identifier, new GenericERC20(genericConfig))

    // no subtokens should be registered by default
    expect(ethereum.subProtocols.length).to.equal(currentSubtokenLength + 1)
  })
})
