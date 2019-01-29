import { GenericERC20, GenericERC20Configuration } from './GenericERC20'

const genericConfig: GenericERC20Configuration = {
  symbol: 'AE-ERC20',
  name: 'æternity Ethereum Token',
  marketSymbol: 'ae',
  identifier: 'eth-erc20-ae',
  contractAddress: '0x5ca9a71b1d01849c0a95490cc00559717fcf0d1d'
}

const AeternityERC20Token = new GenericERC20(genericConfig)

export { AeternityERC20Token }
