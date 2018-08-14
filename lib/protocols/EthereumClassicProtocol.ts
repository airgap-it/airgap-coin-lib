import { EthereumProtocol } from './EthereumProtocol'

export class EthereumClassicProtocol extends EthereumProtocol {
  constructor() {
    super('https://mew.epool.io/', 'https://classic.trustwalletapp.com', 61) // we probably need another network here, explorer is ok
  }
}
