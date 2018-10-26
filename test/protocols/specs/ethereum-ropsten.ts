import BigNumber from 'bignumber.js'
import { EthereumRopstenProtocol } from '../../../lib'
import { EthereumRopstenProtocolStub } from '../stubs/ethereum-ropsten.stub'

const ethereumRopstenProtocol = {
  name: 'EthereumRopsten',
  lib: new EthereumRopstenProtocol(),
  stub: new EthereumRopstenProtocolStub(),
  wallet: {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    address: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
    tx: {
      amount: new BigNumber('1000000000000000000'),
      fee: new BigNumber('420000000000000')
    }
  },
  txs: [
    {
      unsignedTx: {
        from: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        nonce: 80,
        gasPrice: new BigNumber('0x4a817c800'),
        gasLimit: new BigNumber('0x5208', 16),
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: new BigNumber('0xde0b6b3a7640000'),
        chainId: 3
      },
      signedTx:
        'f86c508504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a7640000802aa09270214b35e31fb9cbb106c35ff34b4abad14c77f69d98b039be9c6a6382884aa066fd4b84461179e4daf0da72caba8ce569f48893af160201bf26157f7f532c84'
    }
  ]
}

export { ethereumRopstenProtocol }
