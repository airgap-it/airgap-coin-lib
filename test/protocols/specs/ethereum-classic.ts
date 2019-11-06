import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'

import { EthereumClassicProtocol } from '../../../src'
import { TestProtocolSpec } from '../implementations'
import { EthereumProtocolStub } from '../stubs/ethereum.stub'

export class EthereumClassicTestProtocolSpec extends TestProtocolSpec {
  public name = 'EthereumClassic'
  public lib = new EthereumClassicProtocol()
  public stub = new EthereumProtocolStub()
  public validAddresses = []
  public wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e']
  }
  public txs = [
    {
      amount: new BigNumber('1000000000000000000'),
      fee: new BigNumber('420000000000000'),
      to: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      from: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
      unsignedTx: {
        nonce: '0x0',
        gasPrice: '0x4a817c800',
        gasLimit: '0x5208',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 61
      },
      signedTx:
        'f86d808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a764000080819ea00a595dfbf9fcfd718ecb028a545f575b7394029c284f4b7401c1ef12b8562469a02c1d0373e6d8468a078730eb642270e33ad0124c7be79d971c30b168e93904ee'
    }
  ]
}
