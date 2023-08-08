// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey } from '@airgap/module-kit'

import { MinaSignedTransaction, MinaUnits, MinaUnsignedTransaction } from '../../src/v1'
import { MinaProtocolImpl } from '../../src/v1/protocol/MinaProtocol'
import { TestProtocolSpec } from '../implementations'
import { MinaProtocolStub } from '../stubs/mina.stub'

// Test Mnemonic: food talent voyage degree siege clever account medal film remind good kind
// Derivation path: m/44'/12586'/0'/0/0
// Address: B62qqVRdiV7S96WnjJyRqu4KRBuU1gk6pVaWxNSpPDytPRBYHd255E8
export class MinaTestProtocolSpec extends TestProtocolSpec {
  public name = 'Mina'
  public stub = new MinaProtocolStub()
  public lib = new MinaProtocolImpl({}, this.stub.nodeStub)

  public validAddresses = [
    'B62qihbqTwvF7gdFd3Q18D3XsAZ8cvdpUz4VzTnP9R4zNSNoPty1KuU',
    'B62qkR4H7VYXXwv4NJzAscKAD7yHDgUaLproZZPiZ9BbW7naTJmSbdx'
  ]

  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'encoded',
      value: 'EKERE61HRXV6mcHvUyKswwxAkobXozMjttxRtsJLSEfRMLmbuVQy'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'encoded',
      value: 'B62qqVRdiV7S96WnjJyRqu4KRBuU1gk6pVaWxNSpPDytPRBYHd255E8'
    } as PublicKey,
    derivationPath: `m/44'/12586'/0'/0/0`,
    addresses: ['B62qqVRdiV7S96WnjJyRqu4KRBuU1gk6pVaWxNSpPDytPRBYHd255E8']
  }

  public txs = [
    {
      from: [this.wallet.addresses[0]],
      to: [this.validAddresses[0]],
      amount: {
        value: '1000000000',
        unit: 'blockchain'
      } as Amount<MinaUnits>,
      fee: {
        value: '1000000',
        unit: 'blockchain'
      } as Amount<MinaUnits>,
      memo: 'memo',
      unsignedTx: {
        type: 'unsigned',
        data: {
          to: this.validAddresses[0],
          from: this.wallet.addresses[0],
          amount: '1000000000',
          fee: '1000000',
          nonce: '10' /* needs to be stubbed */,
          memo: 'memo'
        },
        networkType: 'mainnet'
      } as MinaUnsignedTransaction,
      signedTx: {
        type: 'signed',
        data: {
          to: this.validAddresses[0],
          from: this.wallet.addresses[0],
          amount: '1000000000',
          fee: '1000000',
          nonce: '10' /* needs to be stubbed */,
          memo: 'memo'
        },
        signature: {
          type: 'legacy',
          field: '14542459405744139734294257855287679118140061519919501046564075909230894262608',
          scalar: '17849722270390822285179237315719745921096202277479829915389859623256497270925'
        }
      } as MinaSignedTransaction
    }
  ]

  public seed(): string {
    return '55decc156b78772b5ae97cc4a7a4780c4b299d866abed355a8a6649905eadef4d28f76ff7491526addff6c03f3b200ebaa81dacd9f24def6ec88339a19562b91'
  }

  public mnemonic(): string {
    return 'food talent voyage degree siege clever account medal film remind good kind'
  }

  public messages = []

  public encryptAES = []
}
