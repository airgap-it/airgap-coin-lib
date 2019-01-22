import { ICoinSubProtocol } from '../../ICoinSubProtocol'
import { ICoinProtocol } from '../../ICoinProtocol'
import { HOPTokenProtocol } from './HopRopstenToken'
import { AeternityERC20Token } from './AeToken'

const erc20Tokens: (ICoinSubProtocol & ICoinProtocol)[] = [HOPTokenProtocol, AeternityERC20Token]

export { erc20Tokens }
