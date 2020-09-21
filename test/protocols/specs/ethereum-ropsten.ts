import { EthereumRopstenProtocol } from '../../../src'
import { TestProtocolSpec } from '../implementations'
import { EthereumRopstenProtocolStub } from '../stubs/ethereum-ropsten.stub'

export class EthereumRopstenTestProtocolSpec extends TestProtocolSpec {
  public name = 'EthereumRopsten'
  public lib = new EthereumRopstenProtocol()
  public stub = new EthereumRopstenProtocolStub()
  public validAddresses = ['0xc10aC90B30105A739701689A1404b407A8370FDE']
  public wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      amount: '1000000000000000000',
      fee: '420000000029730',
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      unsignedTx: {
        nonce: '0x50',
        gasPrice: '0x3159709f2',
        gasLimit: '0x7bd9',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 3
      },
      signedTx:
        'f86c508503159709f2827bd9944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a7640000802aa0441be11a678fdcb4fdd70c203f6d35bf0a0d59baa98af7c3fcc288138febdfefa05193efea4682c08cb1c255c4bc989fd2fd32c7c618ab10094adb582aff9e9369'
    }
  ]
}
