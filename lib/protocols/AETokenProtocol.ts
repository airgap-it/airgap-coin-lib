import { GenericERC20 } from './GenericERC20'

export class AETokenProtocol extends GenericERC20 {
  symbol = 'AE-ERC20'
  name = 'æternity Ethereum Token'
  marketSymbol = 'ae'

  identifier = 'eth-erc20-ae'

  constructor() {
    super('0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d') // we probably need another network here, explorer is ok
  }
}
