import { SubProtocolSymbols } from '../../../utils/ProtocolSymbols'

import { GenericERC20, GenericERC20Configuration } from './GenericERC20'

const genericConfig: GenericERC20Configuration = {
  symbol: 'ETH-ERC20',
  name: 'Unknown Ethereum ERC20-Token',
  marketSymbol: 'erc20',
  identifier: SubProtocolSymbols.ETH_ERC20,
  contractAddress: '0x2dd847af80418D280B7078888B6A6133083001C9',
  decimals: 18,
  chainId: 3
}

const ERC20Token = new GenericERC20(genericConfig)

export { ERC20Token }
