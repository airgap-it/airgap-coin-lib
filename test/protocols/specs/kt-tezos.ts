import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'

import { TezosKtProtocol } from '../../../src'
import { TestProtocolSpec } from '../implementations'
import { KtTezosProtocolStub } from '../stubs/kt-tezos.stub'

// Test Mnemonic from using Ledger, 44'/1729'/0'/0'
// leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
// Address: tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L

export class KtTezosTestProtocolSpec extends TestProtocolSpec {
  public name = 'KtTezos'
  public lib = new TezosKtProtocol()
  public stub = new KtTezosProtocolStub()
  public validAddresses = [
    'tz1MecudVJnFZN5FSrriu8ULz2d6dDTR7KaM',
    'tz1awXW7wuXy21c66vBudMXQVAPgRnqqwgTH',
    'tz1Yju7jmmsaUiG9qQLoYv35v5pHgnWoLWbt',
    'tz1Xsrfv6hn86fp88YfRs6xcKwt2nTqxVZYM',
    'tz1NpWrAyDL9k2Lmnyxcgr9xuJakbBxdq7FB',
    'KT1B3vuScLjXeesTAYo19LdnnLgGqyYZtgae',
    'KT1U7Gj8F3B6A7oLyxY8xoXhrXPRv8KcLx7s',
    'KT1TRyLb6E1YT5GUnq5F4BtL3hBFeQcQL6wT',
    'KT1DwFCbxes79DxMeuBzAzW82z6eBVTnYjoN',
    'KT1Ux1JNNVhVVfdDXF1qiyGpS4ZZgDa9MbvH'
  ]
  public wallet = {
    privateKey:
      '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
    publicKey: 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
    addresses: ['KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8', 'KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN', 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy']
  }
  public txs = [
    {
      amount: new BigNumber('1000000'),
      fee: new BigNumber('1420'),
      to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      from: ['KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8'],
      unsignedTx: {
        binaryTransaction:
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb955080164f6f3de7129aa65bdfb6198f6a94a11b2de63eb008c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
      },
      signedTx:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb955080164f6f3de7129aa65bdfb6198f6a94a11b2de63eb008c0bc4fe37bc5000c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600af096707bae7412588422128e08b429fe209f1447854e2c3af1b47e3f656b985854fdfb2376ff7939c2b0aa9f19a517b47419f84eb3e4244d89feb173135110a'
    }
  ]

  public seed() {
    return '5b72ef2589b7bd6e35c349ce682cb574f09726e171f2ea166982bf66a1a815fabb9dcbed182b50a3468f8af7ce1f6a3ca739dbde4241b8b674c25b9b2cc5489c'
  }
}
