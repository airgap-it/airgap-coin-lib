import { TezosProtocol } from './TezosProtocol'

export class TezosAlphaProtocol extends TezosProtocol {
  tezosChainId = 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'
  constructor() {
    super('https://tezrpc.me/alphanet', 'https://test-insight.bitpay.com')
  }
}
