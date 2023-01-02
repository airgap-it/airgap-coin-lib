// tslint:disable: no-object-literal-type-assertion
import { PublicKey, SecretKey } from '@airgap/module-kit'

import { createTezosFA1p2Protocol, createTezosProtocolOptions, TezosFA1p2Protocol } from '../../../src/v1'
import { FA1_MAINNET_CALLBACK_CONTRACT } from '../../../src/v1/protocol/fa/TezosFA1Protocol'
import { FA_MAINNET_SOURCE_ADDRESS } from '../../../src/v1/protocol/fa/TezosFAProtocol'
import { TestProtocolSpec } from '../implementations'
import { TezosFA1p2ProtocolStub } from '../stubs/tezos-fa1p2.stub'

// Test Mnemonic from using Ledger, 44'/1729'/0'/0'
// leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry
// Address: tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L

export class TezosFA1p2TestProtocolSpec extends TestProtocolSpec<TezosFA1p2Protocol> {
  public name = 'Tezos FA1.2'
  public lib = createTezosFA1p2Protocol({
    network: {
      ...createTezosProtocolOptions().network,
      contractAddress: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
      defaultSourceAddress: FA_MAINNET_SOURCE_ADDRESS,
      defaultCallbackContract: FA1_MAINNET_CALLBACK_CONTRACT
    },

    identifier: 'xtz-fa1p2_mock',
    name: 'Mock FA1',

    units: {
      FA1: {
        symbol: { value: 'FA1' },
        decimals: 6
      }
    },
    mainUnit: 'FA1'
  })

  public stub = new TezosFA1p2ProtocolStub()
  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value:
        '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
    } as PublicKey,
    addresses: ['tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L']
  }
  public txs = []

  public seed(): string {
    return '5b72ef2589b7bd6e35c349ce682cb574f09726e171f2ea166982bf66a1a815fabb9dcbed182b50a3468f8af7ce1f6a3ca739dbde4241b8b674c25b9b2cc5489c'
  }

  public mnemonic(): string {
    return 'leopard crouch simple blind castle they elder enact slow rate mad blanket saddle tail silk fury quarter obscure interest exact veteran volcano fabric cherry'
  }
}
