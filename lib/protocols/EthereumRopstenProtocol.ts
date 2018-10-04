import { EthereumProtocol } from './EthereumProtocol'

export class EthereumRopstenProtocol extends EthereumProtocol {
  constructor() {
    super('https://api.myetherwallet.com/rop', 'https://ropsten.trustwalletapp.com/', 3) // we probably need another network here, explorer is ok
  }
}
