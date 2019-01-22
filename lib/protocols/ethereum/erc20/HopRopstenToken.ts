import { GenericERC20 } from './GenericERC20'

const HOPTokenProtocol = new GenericERC20(
  'HOPS-ROPSTEN-ERC20',
  'Hops ERC20 Ropsten Token',
  'hop',
  'eth-erc20-hops-ropsten',
  '0x2dd847af80418D280B7078888B6A6133083001C9',
  'https://ropsten.infura.io/',
  'https://ropsten.trustwalletapp.com/',
  3
)

export { HOPTokenProtocol }
