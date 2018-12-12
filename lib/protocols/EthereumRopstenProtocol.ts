import { EthereumProtocol } from './EthereumProtocol'

export class EthereumRopstenProtocol extends EthereumProtocol {
  constructor() {
    super('https://ropsten.infura.io/', 'https://ropsten.trustwalletapp.com/', 3) // we probably need another network here, explorer is ok
  }
}
