import { expect } from 'chai'
import 'mocha'

import { addSubProtocol, EthereumProtocol, GenericERC20, GenericERC20Configuration, TezosKtProtocol, TezosProtocol } from '../../src'

describe(`SubTokens`, () => {
  it('should be able to add a GenericERC20 Sub-Token to Ethereum', async () => {
    const ethereum = new EthereumProtocol()

    const genericConfig: GenericERC20Configuration = {
      symbol: 'Test-Symbol',
      name: 'SuperTestToken',
      marketSymbol: 'test-market-symbol',
      identifier: 'eth-erc20-test' as any,
      contractAddress: '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d',
      decimals: 18
    }

    // no subtokens should be registered by default
    const currentSubtokenLength = ethereum.subProtocols.length

    addSubProtocol(ethereum, new GenericERC20(genericConfig))

    // no subtokens should be registered by default
    expect(ethereum.subProtocols.length).to.equal(currentSubtokenLength + 1)
  })

  it('should be able to add a Sub-Token to Tezos', async () => {
    const tezos = new TezosProtocol()

    // no subtokens should be registered by default
    const currentSubtokenLength = tezos.subProtocols.length

    addSubProtocol(tezos, new TezosKtProtocol())

    // no subtokens should be registered by default
    expect(tezos.subProtocols.length).to.equal(currentSubtokenLength + 1)
  })
})
