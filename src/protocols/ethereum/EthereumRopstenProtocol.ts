import { BaseEthereumProtocol } from './BaseEthereumProtocol'

export class EthereumRopstenProtocol extends BaseEthereumProtocol {
  constructor() {
    super('https://ropsten.infura.io/', 'https://ropsten.trustwalletapp.com', 3) // we probably need another network here, explorer is ok
  }
}
