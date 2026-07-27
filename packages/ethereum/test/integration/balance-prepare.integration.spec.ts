// tslint:disable: no-floating-promises
import 'mocha'

import { IntegrationProtocolContext } from '../../../core/test/integration/types'
import { isIntegrationLive } from '../../../core/test/integration/env'
import { registerIntegrationSuite } from '../../../core/test/integration/runner'
import { EthereumTestProtocolSpec } from '../v1/specs/ethereum'

const protocol = new EthereumTestProtocolSpec()
const live = isIntegrationLive()

function createContext(): IntegrationProtocolContext {
  const tx = protocol.txs[0]

  return {
    name: protocol.name,
    coin: 'eth',
    lib: protocol.lib,
    // extendedPublicKey (not publicKey) is the key that derives wallet.addresses[0]
    publicKey: protocol.wallet.extendedPublicKey,
    addresses: protocol.wallet.addresses,
    balance: {
      exact: live ? undefined : '100000000000000000000',
      min: live ? '0' : undefined
    },
    prepare: {
      to: tx.to[0],
      // Live mode prepares with amount 0 so the check works on low/zero-balance monitoring wallets.
      amount: live ? { value: '0', unit: 'blockchain' } : tx.amount,
      fee: tx.fee,
      unsignedTx: tx.unsignedTx
    }
  }
}

registerIntegrationSuite(createContext(), async () => protocol.stub.registerStub(protocol))
