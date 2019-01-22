import { BaseEthereumProtocol } from './BaseEthereumProtocol'

export class EthereumClassicProtocol extends BaseEthereumProtocol {
  constructor() {
    super('https://mew.epool.io/', 'https://classic.trustwalletapp.com', 61) // we probably need another network here, explorer is ok
  }
}
