import BigNumber from 'bignumber.js'
import { HOPTokenProtocol } from '../../../lib'
import { ERC20ProtocolStub } from '../stubs/erc20.stub'

const erc20HopRopstenToken = {
  name: 'HOP Token ERC20',
  lib: new HOPTokenProtocol(),
  stub: new ERC20ProtocolStub(),
  wallet: {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    address: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
    tx: {
      amount: new BigNumber('5').shiftedBy(new HOPTokenProtocol().decimals),
      fee: new BigNumber('31705000000000')
    }
  },
  txs: [
    {
      mandatoryProperties: ['from', 'nonce', 'gasPrice', 'gasLimit', 'to', 'value', 'chainId'],
      unsignedTx: {
        from: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        nonce: 80,
        gasPrice: new BigNumber('0x3b9aca00'), // 1 gwei
        gasLimit: new BigNumber('31705'), // 31705
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: new BigNumber('5').shiftedBy(new HOPTokenProtocol().decimals),
        chainId: 3,
        data:
          '0xa9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f40000'
      },
      signedTx:
        'f8a850843b9aca00827bd9942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f4000029a08d49aaad012ffd039a405db5087683df85330ec4a8aad984a9e576fa21584198a0757c8decf24b5a95f33a25b6a968c392d832896e8c956a2bd24078519cca1b58'
    },
    // second tx without data property, for backwards compatibility
    {
      mandatoryProperties: ['from', 'nonce', 'gasPrice', 'gasLimit', 'to', 'value', 'chainId'],
      unsignedTx: {
        from: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        nonce: 80,
        gasPrice: new BigNumber('0x3b9aca00'), // 1 gwei
        gasLimit: new BigNumber('31705'), // 31705
        to: '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e',
        value: new BigNumber('5').shiftedBy(new HOPTokenProtocol().decimals),
        chainId: 3
      },
      signedTx:
        'f8a850843b9aca00827bd9942dd847af80418d280b7078888b6a6133083001c980b844a9059cbb0000000000000000000000004a1e1d37462a422873bfccb1e705b05cc4bd922e0000000000000000000000000000000000000000000000004563918244f4000029a08d49aaad012ffd039a405db5087683df85330ec4a8aad984a9e576fa21584198a0757c8decf24b5a95f33a25b6a968c392d832896e8c956a2bd24078519cca1b58'
    }
  ]
}

export { erc20HopRopstenToken }
