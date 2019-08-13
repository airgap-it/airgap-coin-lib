import * as sinon from 'sinon'

import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosProtocol } from '../../../src/protocols/tezos/TezosProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class KtTezosProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const stub = sinon.stub(axios, 'get')

    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 917315 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`)
      .returns(Promise.resolve({ data: { key: 'test-key' } }))

    // mock balance of KT addresses
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
      .returns(Promise.resolve({ data: 100000000 }))

    stub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/balance`)
      .returns(Promise.resolve({ data: 100000000 }))

    stub.withArgs(`${protocol.baseApiUrl}/v3/operations/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L?type=Origination`).returns(
      Promise.resolve({
        data: [
          {
            hash: 'oortkWqdRGi8wTFBnG5Dk8md9DNt8zFEYTXf8whXYBnqbkU3xK9',
            block_hash: 'BKsWTFKmzYtZxE514X2st55aujd3VAfQBrj5DsTePGe6vtsZQQV',
            network_hash: 'NetXdQprcVkpaWU',
            type: {
              kind: 'manager',
              source: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
              operations: [
                {
                  kind: 'origination',
                  src: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
                  managerPubkey: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
                  balance: 0,
                  spendable: false,
                  delegatable: false,
                  tz1: { tz: 'KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN' },
                  failed: false,
                  internal: false,
                  burn_tez: 257000,
                  counter: 917320,
                  fee: 1400,
                  gas_limit: '10000',
                  storage_limit: '257',
                  op_level: 263268,
                  timestamp: '2019-01-09T16:52:46Z'
                }
              ]
            }
          },
          {
            hash: 'ooqg6smMbXwVoVrLgwJjJbHi4gFUB49DZSPiCox7mqmSAuo9CJz',
            block_hash: 'BMFmVehT2vFpbKNPsYtpzjAFaZeXwm9igiRJp3gaBEywAoAJ67d',
            network_hash: 'NetXdQprcVkpaWU',
            type: {
              kind: 'manager',
              source: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
              operations: [
                {
                  kind: 'origination',
                  src: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
                  managerPubkey: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
                  balance: 0,
                  spendable: false,
                  delegatable: false,
                  tz1: { tz: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy' },
                  failed: false,
                  internal: false,
                  burn_tez: 257000,
                  counter: 917318,
                  fee: 1400,
                  gas_limit: '10000',
                  storage_limit: '257',
                  op_level: 263229,
                  timestamp: '2019-01-09T16:11:16Z'
                }
              ]
            }
          },
          {
            hash: 'op1AT5tSAD5PP5c5rSH4B27bQ5uHPqspKetmpCmHbVhSbGqoM5a',
            block_hash: 'BLF7yz2gZsaXJgmk1XRZc3to1LFueU1vA24RRPAdwGNeR3xxg8G',
            network_hash: 'NetXdQprcVkpaWU',
            type: {
              kind: 'manager',
              source: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
              operations: [
                {
                  kind: 'origination',
                  src: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
                  managerPubkey: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
                  balance: 0,
                  spendable: false,
                  delegatable: false,
                  tz1: { tz: 'KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8' },
                  failed: false,
                  internal: false,
                  burn_tez: 257000,
                  counter: 917322,
                  fee: 1400,
                  gas_limit: '10000',
                  storage_limit: '257',
                  op_level: 264235,
                  timestamp: '2019-01-10T09:40:47Z'
                }
              ]
            }
          }
        ]
      })
    )
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    sinon
      .stub(Object.getPrototypeOf(protocol), 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
