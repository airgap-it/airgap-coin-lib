// tslint:disable: no-floating-promises
import 'mocha'

import { IntegrationProtocolContext } from '../../../core/test/integration/types'
import { isIntegrationLive } from '../../../core/test/integration/env'
import { registerIntegrationSuite } from '../../../core/test/integration/runner'
import { BitcoinProtocolSpec } from '../v1/specs/bitcoin'

const protocol = new BitcoinProtocolSpec()
const live = isIntegrationLive()

function createContext(): IntegrationProtocolContext {
  const tx = protocol.txs[0]

  return {
    name: protocol.name,
    coin: 'btc',
    lib: protocol.lib,
    publicKey: protocol.wallet.extendedPublicKey,
    addresses: protocol.wallet.addresses,
    checkAddressesBalance: true,
    balance: {
      exact: live ? undefined : '32418999',
      min: live ? '0' : undefined
    },
    prepare: {
      to: tx.to[0],
      // Live mode prepares with amount 0; BTC still needs spendable UTXOs to cover the fee.
      amount: live ? { value: '0', unit: 'blockchain' } : { value: tx.unsignedTx.outs[0].value, unit: 'blockchain' },
      fee: tx.fee,
      unsignedTx: tx.unsignedTx
    }
  }
}

registerIntegrationSuite(createContext(), async () => protocol.stub.registerStub(protocol))
