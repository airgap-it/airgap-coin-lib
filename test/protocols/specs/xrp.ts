import BigNumber from 'bignumber.js'
import { XrpProtocolStub } from '../stubs/xrp.stub'
import { XrpProtocol } from '../../../lib'
import { TestProtocolSpec } from '../implementations'

export class XrpTestProtocolSpec extends TestProtocolSpec {
  name = 'XRP'
  lib = new XrpProtocol()
  stub = new XrpProtocolStub()
  validAddresses = [
    'rPqinHN9D82L6TvpFNyFRH3AUvPSigAJ7r',
    'r3m9qXwzLMLsBZc7E6pgRFC41jxiBhmGz2',
    'rBE3pP9UjYHeMYWHpWQZi4e3nA2VNnAJGZ',
    'rBy2iAQMWCkrExgsA5tQyu5ziMMrH4yHaK',
    'rfHd7RpgQjw4MFJuCEwVT3fefx6sB8vpsv',
    'rhJym6u7Rk21SSpKtiUjUqKzUCPEDsCDi6',
    'rUzGbZe2sUYWevAb5v18DgeYGjx4LkhJuf',
    'rU2C5J4RJAbZrz4aGeFWg5m2WpgwNAYDKb',
    'rNdpX3Zr6A4eyNTPV6Q6tkqb1DHqCqtrir',
    'rn4fc8j7rqLdqX9L26ACjVCNwPD74huT4Q'
  ]
  wallet = {
    privateKey: '59fcbe4c2471d9fda3c9695e3cbed1be86a2e34ad8d8dd2b425e1fc2161b88a7',
    publicKey: '036b4b11ade765968ffd1e602b469ea3b7f1db7614663e4de05df986b3054920d8',
    addresses: ['r46JsDnHLY7uaSmnnh86Uov4u16xt8eyxT']
  }
  txs = [
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
        chainId: 1,
        data: '0x'
      },
      signedTx:
        'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
    }
  ]
}
