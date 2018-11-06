import BigNumber from 'bignumber.js'
import { HOPTokenProtocol } from '../../../lib'
import { HOPTokenProtocolStub } from '../stubs/erc20-eth-hop.stub'
import { TestProtocolSpec } from '../implementations'

export class ERC20RopstenTestProtocolSpec extends TestProtocolSpec {
  name = 'ERC20 Hop-Token on Ropsten'
  lib = new HOPTokenProtocol()
  stub = new HOPTokenProtocolStub()
  wallet = {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'],
    tx: {
      amount: new BigNumber('1000000000000000000'),
      fee: new BigNumber('420000000000000')
    }
  }
  txs = [
    {
      unsignedTx: {
        nonce: '0x32',
        gasPrice: '0x04a817c800',
        gasLimit: '0x17DFCDECE4000',
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: '0x0',
        chainId: 3
      },
      signedTx:
        'f8a850843b9aca00829281942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000000de0b6b3a76400002aa0289da4fbaa26ab1964abeeaaf5a8e74c8d259224b0cdf723f52fe21a9dd4b0eaa06bac5ae41767c6bb55b5b4f9070181788f5102ac989967f42c72511be0f688ac'
    }
  ]
}
