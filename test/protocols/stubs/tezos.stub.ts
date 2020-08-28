import * as sinon from 'sinon'

import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosProtocol } from '../../../src/protocols/tezos/TezosProtocol'
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementations'

export class TezosProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    const getStub = sinon.stub(axios, 'get')
    const postStub = sinon.stub(axios, 'post')

    // stub
    //   .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/`)
    //   .returns(Promise.resolve({
    //     data: {
    //       "protocol": "PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb",
    //       "chain_id": "NetXdQprcVkpaWU",
    //       "hash": "BKtBGHBzghQGHvQNyG3W4baaMjm6DHok1rZHwnbZjm7cVWyfEiM",
    //       "header": {
    //         "level": 1103619,
    //         "proto": 6,
    //         "predecessor": "BLGEbxZNERS2Gbp4g6c3GzZVSknDC5HpDKTaaFGbdPK3x9SyruB",
    //         "timestamp": "2020-08-28T08:50:39Z",
    //         "validation_pass": 4,
    //         "operations_hash": "LLoavb55TVSCufip483681wMUEmr6tA2yBW3RK7PZqUCfu4vC1KPL",
    //         "fitness": [
    //           "01",
    //           "000000000006d703"
    //         ],
    //         "context": "CoVdmWGussk4jQHhGwvhEpswwjAGyXnKV5iCW7M944g8WAxXYREv",
    //         "priority": 0,
    //         "proof_of_work_nonce": "6b9f3bc3ac2e0100",
    //         "signature": "sigdstKR9zRsegaZuJXSds5gssFBfEm71DsHzqCxq2h8PFUErc8EA4KWgAFscm8U5EQud5Exh2T3i67quRHqg42HEC2rx3qJ"
    //       },
    //       "metadata": {
    //         "protocol": "PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb",
    //         "next_protocol": "PsCARTHAGazKbHtnKfLzQg3kms52kSRpgnDY982a9oYsSXRLQEb",
    //         "test_chain_status": {
    //           "status": "not_running"
    //         },
    //         "max_operations_ttl": 60,
    //         "max_operation_data_length": 16384,
    //         "max_block_header_length": 238,
    //         "max_operation_list_length": [
    //           {
    //             "max_size": 32768,
    //             "max_op": 32
    //           },
    //           {
    //             "max_size": 32768
    //           },
    //           {
    //             "max_size": 135168,
    //             "max_op": 132
    //           },
    //           {
    //             "max_size": 524288
    //           }
    //         ],
    //         "baker": "tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ",
    //         "level": {
    //           "level": 1103619,
    //           "level_position": 1103618,
    //           "cycle": 269,
    //           "cycle_position": 1794,
    //           "voting_period": 33,
    //           "voting_period_position": 22274,
    //           "expected_commitment": false
    //         },
    //         "voting_period_kind": "proposal",
    //         "nonce_hash": null,
    //         "consumed_gas": "20414",
    //         "deactivated": [],
    //         "balance_updates": [
    //           {
    //             "kind": "contract",
    //             "contract": "tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ",
    //             "change": "-512000000"
    //           },
    //           {
    //             "kind": "freezer",
    //             "category": "deposits",
    //             "delegate": "tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ",
    //             "cycle": 269,
    //             "change": "512000000"
    //           },
    //           {
    //             "kind": "freezer",
    //             "category": "rewards",
    //             "delegate": "tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ",
    //             "cycle": 269,
    //             "change": "38750000"
    //           }
    //         ]
    //       },
    //       "operations": []
    //     }
    //   }))

    getStub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/`)
      .returns(Promise.resolve({ data: { "chain_id": "NetXdQprcVkpaWU" } }))

    postStub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/helpers/scripts/run_operation`)
      .returns(Promise.resolve({
        data: {
          contents: [{
            kind: 'transaction',
            metadata: {
              balance_updates: [],
              operation_result: {
                status: 'applied',
                balance_updates: [],
                consumed_gas: '10300',
                paid_storage_size_diff: '0'
              },
              internal_operation_results: [],
            }
          }],
          signature: ''
        }
      }))


    getStub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/counter`)
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/balance`)
      .returns(Promise.resolve({ data: 100000000 }))
    getStub
      .withArgs(`${protocol.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${testProtocolSpec.wallet.addresses[0]}/manager_key`)
      .returns(Promise.resolve({ data: { key: 'test-key' } }))

    return { getStub, postStub }
  }
  public noBalanceStub(testProtocolSpec: TestProtocolSpec, protocol: TezosProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
  }
}
