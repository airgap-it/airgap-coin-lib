import { GenericERC20, GenericERC20Configuration } from './GenericERC20'

const hopProtocolConfig: GenericERC20Configuration = {
  symbol: 'HOPS-ROPSTEN-ERC20',
  name: 'Hops ERC20 Ropsten Token',
  marketSymbol: 'hop',
  identifier: 'eth-erc20-hops-ropsten',
  contractAddress: '0x2dd847af80418D280B7078888B6A6133083001C9',
  decimals: 18,
  jsonRPCAPI: 'https://ropsten.infura.io',
  infoAPI: 'https://ropsten.trustwalletapp.com',
  chainId: 3
}

const HOPTokenProtocol = new GenericERC20(hopProtocolConfig)

export { HOPTokenProtocol }
