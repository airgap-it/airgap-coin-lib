import * as sinon from 'sinon'

import { TezosShieldedTezProtocol } from '../../../src'
import axios from '../../../src/dependencies/src/axios-0.19.0/index'
import BigNumber from '../../../src/dependencies/src/bignumber.js-9.0.0/bignumber'
import { TezosContractCode } from '../../../src/protocols/tezos/types/TezosContractCode'
import { ProtocolHTTPStub } from '../implementations'
import { TezosShieldedTezTestProtocolSpec } from '../specs/tezos-shielded-tez'

export class TezosShieldedTezProtocolStub implements ProtocolHTTPStub {
  public registerStub(testProtocolSpec: TezosShieldedTezTestProtocolSpec, protocol: TezosShieldedTezProtocol) {
    const getStub = sinon.stub(axios, 'get')
    const postStub = sinon.stub(axios, 'post')

    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head`)
      .returns(Promise.resolve({ data: { chain_id: 'NetXdQprcVkpaWU' } }))

    postStub.withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`).returns(
      Promise.resolve({
        data: {
          contents: [
            {
              kind: 'transaction',
              metadata: {
                balance_updates: [],
                operation_result: {
                  status: 'applied',
                  balance_updates: [],
                  consumed_gas: '10300',
                  paid_storage_size_diff: '0'
                },
                internal_operation_results: []
              }
            }
          ],
          signature: ''
        }
      })
    )

    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.tezos.wallet.addresses[0]}/counter`
      )
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.tezos.wallet.addresses[0]}/balance`
      )
      .returns(Promise.resolve({ data: 100000000 }))
    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.tezos.wallet.addresses[0]}/manager_key`
      )
      .returns(Promise.resolve({ data: { key: 'test-key' } }))

    postStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${protocol.contract.address}/script/normalized`
      )
      .returns(
        Promise.resolve<Record<'data', Record<'code', TezosContractCode[]>>>({
          data: {
            code: [
              {
                prim: 'parameter',
                args: [
                  {
                    prim: 'list',
                    args: [
                      {
                        prim: 'pair',
                        args: [
                          {
                            prim: 'sapling_transaction',
                            args: [{ int: '8' }]
                          },
                          {
                            prim: 'option',
                            args: [{ prim: 'key_hash' }]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        })
      )

    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${protocol.contract.address}/entrypoints`)
      .returns(
        Promise.resolve<Record<'data', Record<'entrypoints', any>>>({
          data: { entrypoints: {} }
        })
      )

    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${protocol.contract.address}/single_sapling_get_diff`
      )
      .returns(
        Promise.resolve({
          data: {
            root: '28cc53f02fa3169c264f7642bed7b36e210677c6aa4a96dabd205668804bc845',
            commitments_and_ciphertexts: [
              [
                'adce5475778f4bd65d6d6fdef7b1ad4cc5bc5e834054e2866e9085757c161b68',
                {
                  cv: '8e602731c0b3eba026b0de3d953973addf40f871d48c4b6d088244989e827438',
                  epk: '183f96becd2e0bda45fd92faf211eef6b221ea3bc3c39c6da5c7d1833f0eb1ac',
                  payload_enc:
                    'a4438f29756cdf8c0cffaa77837a581d5e768f5ffa6e2b51ff849e5090ecf5559d6cb7b3a9a6fcd1bae72ed27119ddcc7f32844fea580e9f4c0ffcd9ba24550726a4c87a027e4bfb09b5ca79a85d9a',
                  nonce_enc: '13961dc71c7d146196ac0d06a6b55438d958168392391d43',
                  payload_out:
                    'f7cc81145ce323f1df45062cbdcb836e504dea51c168d2b9fd9c39146070e6462a2bed4d2587431de3a7ba3b3569cd798b70411d1ca0325b0c86841582979486477340813135ce256cd6210c44d64fcc',
                  nonce_out: '82843a7a88e9775e43ae945ae60985a2a1e551a324cf141a'
                }
              ],
              [
                'a543156f34bd4a9708e954abc140a64ca3065d408026910feb3e32f0068aaf0d',
                {
                  cv: '2f91c8c17c3445a90108576777592f8b5b9fc62939fd7376a728bd599f32742c',
                  epk: '4e7834c435e5bef0b96bb5770748a120008e22b6d10a2870321636e1ae86c530',
                  payload_enc:
                    'a4d0d946133a1b1487d1b4671d345ff7252b6b4e98e82a6604f1c76d2a931b5c09e038ab08190fe5149ae359f269eacd27a83df04f8eb7a9f63e772a3093838b3a5b66751c04c15889929dd716bc5f',
                  nonce_enc: '0b763e0d73750586c46069bc3ea8ae94a0198b81d575da2b',
                  payload_out:
                    '9ddd100dd4f91eb9c7caee236bec63ad03e8e449a2d3e5027aabc6500b327577656ebf9e0b870d9aac86771c81b10e85e8a60dc56a64b6b955eb98f710c0be12df5034f9b4c4ad676020f579e5dc7445',
                  nonce_out: '5aa851e2c0bd2184e7ab5bcf91cf87c80c46ba0340a23cde'
                }
              ],
              [
                '6f97a20380194510016bfcb3b8b9f7e2d84e48df0348703c7c26fd8bf1d67b59',
                {
                  cv: '6a32233735be6d41396455320b09da648eb9630a7516d8063a48d95bd0cc85a2',
                  epk: '60c800704f44c0e86e6bd14da1dce0346b0200b011773dfb9ed8fd0aad2b321d',
                  payload_enc:
                    'b2c31a4b1401d69f62ddd11fd560305ab6faf50f3061181a10561e4fa2bef6ac239858cac4baf2ed13c6cef4f3e51d2a8b386cf1be58b41d01547c2701b98cc27fd7e7ef28d95d154cffba0f7ace74',
                  nonce_enc: 'b940e2d627f823293d7bd8f191977047c115a18a0c51e573',
                  payload_out:
                    'f09e41b06bceb0179bfee58c5bbbe9c340bdb0c07f237ce350510e6b52242d1c49d4d7599db242414bb994ebf419fb8e2042585873ec5a9ad90d221d35a4435daf8c566127ff34b0c29d870973001213',
                  nonce_out: '4ecf239024fa628d6cc11b577a6017c94242d6b62f7b5292'
                }
              ],
              [
                '57ab4ce617448616a0c6cbf957d9c7ddbbd23924df23e622c70f957b4c79472b',
                {
                  cv: '6d5261ec4f1fab5aaee2c3c4c6a4bbba502ddbb9eab2ccede36cf0ca403d26a4',
                  epk: '06c0e6fce5c902fbee8144ef800248b5b22ff357d21113c16cfb793f67f59b32',
                  payload_enc:
                    '04453c7e5a4c606963edd609e38ce8ceb6dbdfbd3a7e067dd7804bffb6c237d295f8e6f36097ed7974ea38f1e95bad25847de9fbd084ff86078597b9fb4c45ec935d4c46cd8c4aad780834f7258f0f',
                  nonce_enc: '56851e452e624562ff9bd3e814d08fd704bf4c14c48c208f',
                  payload_out:
                    '1ebaa5dda24e4b59982d8d299635457547f590df66fa10186437c160fd16650fabae840b51cbef4d62b3874e097672b601dc4de7226c1ea8c30a46ed8303b44fdb8a0f2feb1b262f6295b1724c9fb71b',
                  nonce_out: '8ed5d5bb252e09840b5a24d5750dfa67c9960370c19ad84b'
                }
              ],
              [
                'a2891e2ed064d9aa73fb3f4c2f8ace5f41bcbd4ec220d00004f367a4093fa84a',
                {
                  cv: '625a289095304dfa0b145ddb739c8ad6e111711c4611441954469fe3043b1040',
                  epk: 'bd50b0190e0cdaec68147b88547d7945876de7a5d3c7ad2c069db7c9b2ecd34e',
                  payload_enc:
                    '275d387b04023d28e90857ea4438d82df8a0def563c2f263f1b9685c09c2413e9dcb07889e42d9abd86d9f41eb36d068df36f1741c2ef45ea688ab213fd9baa040c3e323e14d4b6a12a2ef16ce7c13',
                  nonce_enc: 'fc5cf705b364fb0b61c071d79b58dae4025e83bb3598775f',
                  payload_out:
                    '55fc1d623a32fd941987ac48dbcf595871aca8391874349df09042515d5ee6e26a18e4ee01f7d887b7d2ce43d9e7de1c4fc4490b320868ba8b097e676e83546c33c929527a69bd6d1a5f271d223024f7',
                  nonce_out: '81534f62f549546d3a730bad361b52d054fc5aa929dbe248'
                }
              ],
              [
                '892765154ed37026299ad5fc5d435d8b76dae35aa7e7c5d6da5e6b141f4dc33c',
                {
                  cv: '70cee412624341677ff4a29bf86fc082559221bd6cd0efb28c1c403aad364773',
                  epk: '5e52d04d06ab78b905871c14f24bb3113cdf5f61edfccd0182d94ad66a171b48',
                  payload_enc:
                    '1b59d6cee5ce00aabf205dfea952f22f651afced857ca5a308369e7d00592ba6e16e42853c7529126627a0ead0f313451169f7e2ef5026922ae2891b86676e336d8a90c4734a86984116eba95a9422',
                  nonce_enc: '13b736ccb7fc3b4eb51095e3f1ea3339dcffe75852e5620e',
                  payload_out:
                    '21d26286df8d160166681858ba48d281bdc23ae24b05e70214d7be4051757f808b139cec841b9e2fc747f4ade160c5e995fefc8d4075d1afeac7a17f6301e54f593dc6e36095a1f11e00e91bb2560607',
                  nonce_out: 'e7898a40886ea8d26f73480864b9e61c718938ade0f39c33'
                }
              ],
              [
                'd79aa02b0acdb7533e4ca00bb25c4af78533a8862cd77a26f52bbce83d490a56',
                {
                  cv: '59b98e0958b5967fbf70833fc15520ebb791a864e2b66e0b9f00521820be51e0',
                  epk: '50f40d0530e193ef269a1824c2e06b7102a83c3b8110d7bf475f8e2253d03746',
                  payload_enc:
                    '683239757d4dc61a237b0de4bc1631e54892977d5fae21b3384f2b5368269dff0ed4d7a926e85ec12e1fd64ea3ee062d0bc29913e7f382d64d696b6c694fae79421734973645cc2158040872d6b696',
                  nonce_enc: 'b12f3a3fd1f4fca8abe1745cf81427fa5b8c0df2f83143c2',
                  payload_out:
                    '29b710e51babe0cd33d20d5c21a6d44a25f7a6160061a844ebd09fd3fa0f0494b33cfe6663fee5f1f5867771e9fdbff56d039b62174e1e1b286034e9281e0f65601e771fccdbd81f943eb76362fb5bfc',
                  nonce_out: '3ff4d56695c0812bd515f53c2151f040b73883b60c9abfba'
                }
              ],
              [
                'd5269c89748f1c2ae3bd440e6e23436f36e557a9a3b7c4c9e36d9d632888ba01',
                {
                  cv: '0e66df1df760d76286ac7884e0566d52bf746f807c0f03826e88620c6d57a1d8',
                  epk: 'a141a8344a26f8fa2443c35a56fa9caf4084054ed43f78f6d7ee683d898ab773',
                  payload_enc:
                    'd37d24a06bd8b55ab94e1de99ad81337976ad86ae6194a32153c579b8345819fbbacdbaab3a01c46de6cdba5300b68783338b083c6683007e42cd1bcadbbe4080307ae75ccddef8117e49804f1d05e',
                  nonce_enc: 'd89b50a85dd065dda794b7d3f166aa752a20de196e1797e1',
                  payload_out:
                    'e158a4e939da2dfb57bf94ee0b7b4e2c1395b893840da45066fad88623108603a78fb76a2e8a14b4f98213aada6532329d538e5efec0dcf5f32b61e99433b2119fb8fd132917c84b9687c2f5b3760515',
                  nonce_out: 'd9cb01785aba0ce6a4c84190f45a0517919538a5591940d5'
                }
              ]
            ],
            nullifiers: [
              '5640f5bbf68dfa6460405f0c6fb641647038e5f015895038e28716dd2b06a718',
              '9698d46327f29cc304098191f2f9e3b41b7e98e55fa762228e05a9daf46e922c',
              '1feae0f6c8d7f17cb5aa40208508bde4d6f167023221a0f9c3c63f212bb24a6c'
            ]
          }
        })
      )

    return { getStub, postStub }
  }

  public noBalanceStub(testProtocolSpec: TezosShieldedTezTestProtocolSpec, protocol: TezosShieldedTezProtocol) {
    sinon
      .stub(protocol, 'getBalanceOfPublicKey')
      .withArgs(sinon.match.any)
      .returns(Promise.resolve(new BigNumber(0)))
    const getStub = sinon.stub(axios, 'get')

    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.tezos.wallet.addresses[0]}/counter`
      )
      .returns(Promise.resolve({ data: 917315 }))
    getStub
      .withArgs(`${protocol.options.network.rpcUrl}/chains/main/blocks/head/hash`)
      .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
    getStub
      .withArgs(
        `${protocol.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${testProtocolSpec.tezos.wallet.addresses[0]}/manager_key`
      )
      .returns(Promise.resolve({ data: { key: 'test-key' } }))
  }
}
