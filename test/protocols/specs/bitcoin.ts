import BigNumber from 'bignumber.js'
import { DeserializedSyncProtocol, SignedTransaction, BitcoinProtocol } from '../../../lib'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'
import { TestProtocolSpec } from '../implementations'

export class BitcoinProtocolSpec extends TestProtocolSpec {
  name = 'Bitcoin'
  lib = new BitcoinProtocol()
  stub = new BitcoinProtocolStub()
  validAddresses = [
    '1NVqzkVsgWhiQmjXKmEvRiJLmyR17yFCwd',
    '19165VoETh1ZAcwNN5pjeXgMCJbmt4rbUB',
    '3JcJdozCssqB1RUGhhZPCSCFeSAE21sep9',
    '3CzQRvFBARhR14mfL6Dcm1XgzTRnvLwhjs'
  ]
  wallet = {
    privateKey: 'xprv9yzvjXeHEDMMM2x8H6btZjyVaB9YBpvR7wdqQhGAEQbsvjrQejHhPdqdMRcAE3MqdZcfrSkCGk96YVqPhFHwJqY7VxgPgmMWMehcmHdQJ5h',
    publicKey: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
    addresses: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc']
  }
  txs = [
    {
      from: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
      to: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000'),
      unsignedTx: {
        ins: [
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('10'),
            vout: 0,
            address: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            derivationPath: '0/0'
          },
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('32418989'),
            vout: 1,
            address: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
            derivationPath: '1/3'
          }
        ],
        outs: [
          {
            recipient: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            isChange: false,
            value: new BigNumber('10')
          },
          {
            recipient: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
            isChange: true,
            value: new BigNumber('32391989')
          }
        ]
      },
      signedTx: `01000000029d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc000000006a473044022052f1e11f331e2b85988f2f0a337496cfedd2192b7fd586938dcfa7dac54b31a90220710f7d7c15339a8f8d643a30ed9ce5fbc0b91e3d532278e83c57ea51ea73cae401210311a202c95426b8aafdd7b482e53a363935eb6491b8bcd8991f16abc810f68868ffffffff9d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc010000006b483045022100d9de30fc11a6faaccc37da920450564d10e9f662fa82681943a471319420d19702202dbfa7574d6a22de1260678b614dd2b686000a94e90190d77fbfefa0f8f443ad0121039114571129b267e9500fd3fb47336eaba1d235651847ce4797733fa6561c4b4fffffffff020a000000000000001976a9142dc610f6d5bfca59507d0dddb986eacfe5c3ed8b88ac3543ee01000000001976a914ffdb27fa921fcf684a85c2ed6321334c07e4c41d88ac00000000`
    }
  ]

  signedTransaction(tx: any): DeserializedSyncProtocol {
    const protocol: DeserializedSyncProtocol = super.signedTransaction(tx)
    const payload = protocol.payload as SignedTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses
    return protocol
  }
}
