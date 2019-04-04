import BigNumber from 'bignumber.js'
import { DeserializedSyncProtocol, SignedTransaction, GroestlcoinProtocol } from '../../../lib'
import { GroestlcoinProtocolStub } from '../stubs/groestlcoin.stub'
import { TestProtocolSpec } from '../implementations'

export class GroestlcoinProtocolSpec extends TestProtocolSpec {
  name = 'Groestlcoin'
  lib = new GroestlcoinProtocol()
  stub = new GroestlcoinProtocolStub()
  validAddresses = [
    'Fo5wJdoDwg7XvDi7ntnMwWv15Vc1UMA7Bz',
    'Fdbvoe7cvqhUieb5ReFeCdhQxhSXuKjDDq',
    '34mYVANQZhdhVpEh3uodhBUUkbW75NFmN9',
    '38vZLCc9MmY5ATUGDBbpW4iGyU2KswjTup',
    'grs1q2udtu5tnqte7exezvj355s27ga297dxshal3kh',
    'grs1q3kfpul4l5nncmnq4npw8qp72rec9y7pxg3nxgs',
    'grs1qj4y2q2ds8wuq3vft3vve5sdadf03q0rxcnxzrv',
    'grs1q24gmqsv6p5rsyw0j2g0pat52jtdqzc02wpl22n',
    'grs1qhpa2lsfrkcmcq8yk8s3s0um7e7uta4vesnd4my',
    'grs1q2rk404unpxru0s27q6mdy2snrhegge8hd5zm4c',
    'grs1qfwqlkwadlmre94jucan05ctxxvdzf4suu63l0y',
    'grs1qtlpls5q9fq3jjwj9ewtt0a56uv05z4rewkvl66',
    'grs1qyl3d3zzdu66yy8u08x693j6sxgsg2xnz69e06f',
    'grs1qavkc8nk0y9f9ul0pgzvr8x5fffntu0mpv9mnu9',
    'grs1qpxhsxeytlwrhj2ssrqqj7s456wmp0d4n9mkl9w',
    '3QJx33XJjxupTo7mGyDCLqU9HpND8GFXFx',
    '3PaJn4UzvPsuke14qDErzsqTR2TtKzn5o7'
  ]
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
