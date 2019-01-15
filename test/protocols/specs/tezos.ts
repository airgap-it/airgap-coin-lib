import BigNumber from 'bignumber.js'
import { TestProtocolSpec } from '../implementations'
import { TezosProtocolStub } from '../stubs/tezos.stub'
import { DeserializedSyncProtocol, SignedTransaction } from '../../../lib'
import { TezosProtocol } from '../../../lib/protocols/TezosProtocol'

// Test Mnemonic from using Ledger, 44'/1729'/0'/0'
// leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
// Address: tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L

export class TezosTestProtocolSpec extends TestProtocolSpec {
  name = 'Tezos'
  lib = new TezosProtocol()
  stub = new TezosProtocolStub()
  wallet = {
    privateKey:
      '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
    publicKey: 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234',
    addresses: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
    tx: {
      amount: new BigNumber('1000000'),
      fee: new BigNumber('1420')
    }
  }
  txs = [
    {
      to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      unsignedTx: {
        binaryTransaction:
          'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37f44e00c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
      },
      signedTx:
        'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb95508000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37f44e00c0843d000091a9d2b003f19cf5a1f38f04f1000ab482d3317600266fcf757017eef2b68c5f482f64d13cbd9f027b1886fe90e03d5ef449df968b1f5f58675532cae0020b1f10bbd18ad5f0a00672da7a26cddd75ea847d0e1b09'
    }
  ]

  seed() {
    return '5b72ef2589b7bd6e35c349ce682cb574f09726e171f2ea166982bf66a1a815fabb9dcbed182b50a3468f8af7ce1f6a3ca739dbde4241b8b674c25b9b2cc5489c'
  }
}
