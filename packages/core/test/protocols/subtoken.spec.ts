import { expect } from 'chai'
import 'mocha'

import { addSubProtocol, EthereumProtocol, GenericERC20, TezosKtProtocol, TezosProtocol } from '../../src'
import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolNetwork
} from '../../src/protocols/ethereum/EthereumProtocolOptions'

describe(`SubTokens`, () => {
  it('should be able to add a GenericERC20 Sub-Token to Ethereum', async () => {
    const ethereum = new EthereumProtocol()

    // no subtokens should be registered by default
    const currentSubtokenLength = ethereum.subProtocols.length

    addSubProtocol(
      ethereum,
      new GenericERC20(
        new EthereumERC20ProtocolOptions(
          new EthereumProtocolNetwork(),
          new EthereumERC20ProtocolConfig(
            'Test-Symbol',
            'SuperTestToken',
            'test-market-symbol',
            'eth-erc20-test' as any,
            '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d',
            18
          )
        )
      )
    )

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
