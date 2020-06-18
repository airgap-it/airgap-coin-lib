import { SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolConfig,
  EthereumProtocolNetwork
} from '../EthereumProtocolOptions'

import { GenericERC20 } from './GenericERC20'

const ERC20Token = new GenericERC20(
  new EthereumERC20ProtocolOptions(
    new EthereumProtocolNetwork(),
    new EthereumERC20ProtocolConfig(
      'ETH-ERC20',
      'Unknown Ethereum ERC20-Token',
      'erc20',
      SubProtocolSymbols.ETH_ERC20,
      '0x2dd847af80418D280B7078888B6A6133083001C9',
      18,
      new EthereumProtocolConfig(3)
    )
  )
)

export { ERC20Token }
