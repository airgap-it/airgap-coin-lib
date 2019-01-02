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
      amount: new BigNumber('100000000'),
      fee: new BigNumber('50000')
    }
  }
  txs = [
    {
      to: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      from: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'],
      unsignedTx: {
        jsonTransaction: {
          branch: 'BMHBtAaUv59LipV1czwZ5iQkxEktPJDE7A9sYXPkPeRzbBasNY8',
          contents: [
            {
              kind: 'transaction',
              source: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
              fee: '50000',
              counter: '3',
              gas_limit: '10100',
              storage_limit: '0',
              amount: '100000000',
              destination: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
            }
          ]
        },
        binaryTransaction:
          'ce69c5713dac3537254e7be59759cf59c15abd530d10501ccf9028a5786314cf08000091a9d2b003f19cf5a1f38f04f1000ab482d33176d0860303f44e0080c2d72f000091a9d2b003f19cf5a1f38f04f1000ab482d3317600'
      },
      signedTx: {
        transaction: {
          branch: 'BMHBtAaUv59LipV1czwZ5iQkxEktPJDE7A9sYXPkPeRzbBasNY8',
          contents: [
            {
              kind: 'transaction',
              source: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
              fee: '50000',
              counter: '3',
              gas_limit: '10100',
              storage_limit: '0',
              amount: '100000000',
              destination: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
            }
          ]
        },
        bytes: Buffer.from(
          'ce69c5713dac3537254e7be59759cf59c15abd530d10501ccf9028a5786314cf08000002298c03ed7d454a101eb7022bc95f7e5f41ac78d0860303c8010080c2d72f0000e7670f32038107a59a2b9cfefae36ea21f5aa63c00'
        ),
        signature: 'edsigu5Cb8WEmUZzoeGSL3sbSuswNFZoqRPq5nXA18Pg4RHbhnFqshL2Rw5QJBM94UxdWntQjmY7W5MqBDMhugLgqrRAWHyH5hD'
      }
    }
  ]

  signedTransaction(tx: any): DeserializedSyncProtocol {
    const protocol: DeserializedSyncProtocol = super.signedTransaction(tx)
    const payload = protocol.payload as SignedTransaction
    payload.amount = this.wallet.tx.amount
    payload.fee = this.wallet.tx.fee
    payload.from = this.wallet.addresses
    return protocol
  }

  seed() {
    return '5b72ef2589b7bd6e35c349ce682cb574f09726e171f2ea166982bf66a1a815fabb9dcbed182b50a3468f8af7ce1f6a3ca739dbde4241b8b674c25b9b2cc5489c'
  }
}
