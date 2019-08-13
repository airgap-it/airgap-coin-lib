import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'

import { BitcoinProtocol, DeserializedSyncProtocol, SignedTransaction } from '../../../src'
import { TestProtocolSpec } from '../implementations'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'

export class BitcoinProtocolSpec extends TestProtocolSpec {
  public name = 'Bitcoin'
  public lib = new BitcoinProtocol()
  public stub = new BitcoinProtocolStub()
  public validAddresses = [
    '1NVqzkVsgWhiQmjXKmEvRiJLmyR17yFCwd',
    '19165VoETh1ZAcwNN5pjeXgMCJbmt4rbUB',
    '3JcJdozCssqB1RUGhhZPCSCFeSAE21sep9',
    '3CzQRvFBARhR14mfL6Dcm1XgzTRnvLwhjs'
  ]
  public wallet = {
    privateKey: 'xprv9yzvjXeHEDMMM2x8H6btZjyVaB9YBpvR7wdqQhGAEQbsvjrQejHhPdqdMRcAE3MqdZcfrSkCGk96YVqPhFHwJqY7VxgPgmMWMehcmHdQJ5h',
    publicKey: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
    addresses: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc']
  }
  public txs = [
    {
      from: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
      to: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000'),
      unsignedTx: {
        ins: [
          {
            txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
            value: new BigNumber('10'),
            vout: 0,
            address: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            derivationPath: '0/0'
          },
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('32418989'),
            vout: 0,
            address: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
            derivationPath: '1/2'
          }
        ],
        outs: [
          {
            recipient: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            isChange: false,
            value: new BigNumber('10')
          },
          {
            recipient: '18MwerXaLVrTshUSJyg8ZZAq2LhJwia9QE',
            isChange: true,
            value: new BigNumber('32391989')
          }
        ]
      },
      signedTx: `01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006a47304402202a449911bc9c0deb77fc326fed98bd10d0d70a650bbb7e20964dfaac5ae7ca07022020c2af3ce6a6f2686f72e4fbf0ee582a14e5344d9825aec445d341931dae65d601210311a202c95426b8aafdd7b482e53a363935eb6491b8bcd8991f16abc810f68868ffffffff9d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc000000006b483045022100f515e7d18601cf1fe263d872ead795ddf5d019c11dab0ad63d737a724bc0d82402204fdaf34ed9d2f7eb765177261b7370063a35385f2a95d685d97e9951dc6ce6b0012102f5ec5458a1d3ce47e87e606df057e6efdfa4c3190b492b115418376865682cacffffffff020a000000000000001976a9142dc610f6d5bfca59507d0dddb986eacfe5c3ed8b88ac3543ee01000000001976a91450bed24b350241ac16f72144cfa4849138013aed88ac00000000`
    }
  ]

  public signedTransaction(tx: any): DeserializedSyncProtocol {
    const protocol: DeserializedSyncProtocol = super.signedTransaction(tx)
    const payload = protocol.payload as SignedTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses
    return protocol
  }
}
