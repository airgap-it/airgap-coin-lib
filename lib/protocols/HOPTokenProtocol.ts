import { GenericERC20 } from './GenericERC20'

export class HOPTokenProtocol extends GenericERC20 {
  constructor() {
    super('0x2dd847af80418D280B7078888B6A6133083001C9', 'https://ropsten.infura.io/', 'https://ropsten.trustwalletapp.com/', 3) // we probably need another network here, explorer is ok
  }
}
