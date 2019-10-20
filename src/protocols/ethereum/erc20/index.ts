import { ICoinProtocol } from '../../ICoinProtocol'
import { ICoinSubProtocol } from '../../ICoinSubProtocol'

import { AeternityERC20Token } from './AeToken'
import { HOPTokenProtocol } from './HopRopstenToken'

const erc20Tokens: (ICoinSubProtocol & ICoinProtocol)[] = [HOPTokenProtocol, AeternityERC20Token]

export { erc20Tokens }
