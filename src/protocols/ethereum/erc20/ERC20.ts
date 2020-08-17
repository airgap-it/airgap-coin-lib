import { SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolNetwork,
  EthereumProtocolNetworkExtras
} from '../EthereumProtocolOptions'

import { GenericERC20 } from './GenericERC20'

const ERC20Token = new GenericERC20(
  new EthereumERC20ProtocolOptions(
    new EthereumProtocolNetwork(undefined, undefined, undefined, undefined, new EthereumProtocolNetworkExtras(3)),
    new EthereumERC20ProtocolConfig(
      'ETH-ERC20',
      'Unknown Ethereum ERC20-Token',
      'erc20',
      SubProtocolSymbols.ETH_ERC20,
      '0xB4272071eCAdd69d933AdcD19cA99fe80664fc08',
      18
    )
  )
)

export { ERC20Token }
