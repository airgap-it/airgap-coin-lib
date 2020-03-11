import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'

import { addSubProtocol } from '../../../src'
import { ERC20Token } from '../../../src/protocols/ethereum/erc20/ERC20'
import { TestProtocolSpec } from '../implementations'
import { GenericERC20ProtocolStub } from '../stubs/generic-erc20.stub'

const protocol = ERC20Token

addSubProtocol('eth', protocol)

export class GenericERC20TokenTestProtocolSpec extends TestProtocolSpec {
  public name = 'Generic ERC20 Token'
  public lib = protocol
  public stub = new GenericERC20ProtocolStub()
  public validAddresses = []
  public wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      amount: new BigNumber('5').shiftedBy(protocol.decimals).toString(10),
      fee: '31705000000000',
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      mandatoryProperties: ['data', 'nonce', 'gasPrice', 'gasLimit', 'to', 'value', 'chainId'],
      unsignedTx: {
        nonce: '0x50',
        gasLimit: '0x7bd9', // 31705
        gasPrice: '0x3b9aca00', // 1 gwei
        to: '0x2dd847af80418D280B7078888B6A6133083001C9', // contract address
        value: '0x0',
        chainId: 3,
        data:
          '0xa9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f40000'
      },
      signedTx:
        'f8a850843b9aca00827bd9942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f4000029a08d49aaad012ffd039a405db5087683df85330ec4a8aad984a9e576fa21584198a0757c8decf24b5a95f33a25b6a968c392d832896e8c956a2bd24078519cca1b58'
    }
  ]
}
