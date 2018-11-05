import BigNumber from 'bignumber.js'
import { BitcoinProtocol } from '../../../dist'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'

const bitcoinProtocol = {
  name: 'Bitcoin',
  lib: new BitcoinProtocol(),
  stub: new BitcoinProtocolStub(),
  wallet: {
    privateKey: '832d58a77ad222b8d9b75322e66d97e46b7dcfab3f25f6c1dd79ec13e046c7bc',
    publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
    addresses: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
    tx: {
      from: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
      to: ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000')
    }
  },
  txs: [
    {
      unsignedTx: {
        ins: [
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('10'),
            vout: 0,
            address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            derivationPath: '0/0'
          },
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('32418989'),
            vout: 1,
            address: 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX',
            derivationPath: '1/3'
          }
        ],
        outs: [
          {
            recipient: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
            isChange: false,
            value: new BigNumber('10')
          },
          {
            recipient: 'miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq',
            isChange: true,
            value: new BigNumber('32391989')
          }
        ]
      },
      signedTx:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]
}

export { bitcoinProtocol }
