import { SubProtocolSymbols } from '../../../utils/ProtocolSymbols'
import { RskERC20ProtocolConfig, RskERC20ProtocolOptions, RskProtocolNetwork, RskProtocolNetworkExtras } from '../RskProtocolOptions'

import { GenericRskERC20 } from './GenericRskERC20'

const RskERC20 = new GenericRskERC20(
  new RskERC20ProtocolOptions(
    new RskProtocolNetwork(undefined, undefined, undefined, undefined, new RskProtocolNetworkExtras(30)),
    new RskERC20ProtocolConfig(
      'RIF',
      'RSK Infrastructure Framework',
      'rif',
      SubProtocolSymbols.RBTC_ERC20,
      '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
      18
    )
  )
)

export { RskERC20 }
