import { ICoinProtocol } from '../../ICoinProtocol'
import { ICoinSubProtocol } from '../../ICoinSubProtocol'

import { AeternityERC20Token } from './AeToken'

const erc20Tokens: (ICoinSubProtocol & ICoinProtocol)[] = [AeternityERC20Token]

export { erc20Tokens }
