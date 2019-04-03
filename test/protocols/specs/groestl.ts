import BigNumber from 'bignumber.js'
import { DeserializedSyncProtocol, SignedTransaction, GroestlcoinProtocol } from '../../../lib'
import { GroestlcoinProtocolStub } from '../stubs/groestlcoin.stub'
import { TestProtocolSpec } from '../implementations'

export class GroestlcoinProtocolSpec extends TestProtocolSpec {
  name = 'Groestlcoin'
  lib = new GroestlcoinProtocol()
  stub = new GroestlcoinProtocolStub()
  validAddresses = ['FkPxwoFcgf16MpYka596GK3HV4SSiAPanR', 'FbC5C7QRwBY2fsTV7xVgjDwnXwLkDkZV3B', 'FfdwiqX6B8TD1JunHVv5YfhB8YdweQibV9']
  wallet = {
    privateKey: 'xprv9yzvjXeHEDMMM2x8H6btZjyVaB9YBpvR7wdqQhGAEQbsvjrQejHhPdqdMRcAE3MqdZcfrSkCGk96YVqPhFHwJqY7VxgPgmMWMehcmEydJ5A',
    publicKey: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFwyemtF',
    addresses: ['fzlk8rmka9wnmhsawtc7udqna29dtmm5er', 'FbC5C7QRwBY2fsTV7xVgjDwnXwLkDkZV3B']
  }
  txs = [
    {
      from: ['fzlk8rmka9wnmhsawtc7udqna29dtmm5er', 'FbC5C7QRwBY2fsTV7xVgjDwnXwLkDkZV3B'],
      to: ['FZ4AfMJjHNzjtMHvFR244TZf2934Y6J5Fr'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000'),
      unsignedTx: {
        ins: [
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('10'),
            vout: 0,
            address: 'FZ4AfMJjHNzjtMHvFR244TZf2934Y6J5Fr',
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
            recipient: 'FZ4AfMJjHNzjtMHvFR244TZf2934Y6J5Fr',
            isChange: false,
            value: new BigNumber('10')
          },
          {
            recipient: 'FbC5C7QRwBY2fsTV7xVgjDwnXwLkDkZV3B',
            isChange: true,
            value: new BigNumber('32391989')
          }
        ]
      },
      signedTx: ``
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
