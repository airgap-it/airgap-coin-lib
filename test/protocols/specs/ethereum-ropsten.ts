import { EthereumRopstenProtocol } from '../../../src'
import { TestProtocolSpec } from '../implementations'
import { EthereumRopstenProtocolStub } from '../stubs/ethereum-ropsten.stub'

export class EthereumRopstenTestProtocolSpec extends TestProtocolSpec {
  public name = 'EthereumRopsten'
  public lib = new EthereumRopstenProtocol()
  public stub = new EthereumRopstenProtocolStub()
  public validAddresses = []
  public wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      amount: '1000000000000000000',
      fee: '420000000000000',
      transactionFee: '420000000000000',
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      unsignedTx: {
        nonce: '0x50',
        gasPrice: '0x4a817c800',
        gasLimit: '0x5208',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 3
      },
      signedTx:
        'f86c508504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a7640000802aa09270214b35e31fb9cbb106c35ff34b4abad14c77f69d98b039be9c6a6382884aa066fd4b84461179e4daf0da72caba8ce569f48893af160201bf26157f7f532c84'
    }
  ]
}
