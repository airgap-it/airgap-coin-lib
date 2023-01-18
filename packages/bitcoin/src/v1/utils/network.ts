import { assertNever, Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'

import { BitcoinProtocolNetwork } from '../types/protocol'

export function getBitcoinJSNetwork(protocolNetwork: BitcoinProtocolNetwork, bitcoinJS: any): any {
  switch (protocolNetwork.type) {
    case 'mainnet':
      return bitcoinJS.networks.bitcoin
      break
    case 'testnet':
      return bitcoinJS.networks.testnet
      break
    case 'custom':
      return bitcoinJS.networks[protocolNetwork.bitcoinjsNetworkName]
    default:
      assertNever(protocolNetwork)
      throw new UnsupportedError(Domain.BITCOIN, 'Unsupported protocol network type.')
  }
}
