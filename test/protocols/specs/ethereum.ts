import BigNumber from 'bignumber.js'
import { EthereumProtocolStub } from '../stubs/ethereum.stub'
import { EthereumProtocol } from '../../../lib'

const ethereumProtocol = {
  name: 'Ethereum',
  lib: new EthereumProtocol(),
  stub: new EthereumProtocolStub(),
  wallet: {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
    tx: {
      amount: new BigNumber('1000000000000000000'),
      fee: new BigNumber('420000000000000')
    }
  },
  txs: [
    {
      unsignedTx: {
        nonce: '0x0',
        gasPrice: '0x4a817c800',
        gasLimit: '0x5208',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0xde0b6b3a7640000',
        chainId: 1,
        data: '0x'
      },
      signedTx:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]
}

export { ethereumProtocol }
