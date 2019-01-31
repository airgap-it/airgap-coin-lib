import { GenericERC20, GenericERC20Configuration } from './GenericERC20'

const genericConfig: GenericERC20Configuration = {
  symbol: 'ETH-ERC20',
  name: 'Unknown Ethereum ERC20-Token',
  marketSymbol: 'erc20',
  identifier: 'eth-erc20',
  contractAddress: '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d',
  decimals: 18
}

const ERC20Token = new GenericERC20(genericConfig)

export { ERC20Token }
