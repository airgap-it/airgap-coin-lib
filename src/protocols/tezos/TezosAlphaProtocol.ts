import { TezosProtocol } from './TezosProtocol'

export class TezosAlphaProtocol extends TezosProtocol {
  constructor() {
    super('https://tezrpc.me/alphanet', 'https://test-insight.bitpay.com')
  }
}
