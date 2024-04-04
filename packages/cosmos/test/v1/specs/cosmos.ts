// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'
import {
  CosmosCoin,
  CosmosSendMessage,
  CosmosPagedSendTxsResponse,
  CosmosFee,
  CosmosUnsignedTransaction,
  CosmosSignedTransaction,
  CosmosTransaction
} from '@airgap/cosmos-core'
import { CosmosDenom, createCosmosProtocol } from '../../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { CosmosProtocolStub } from '../stubs/cosmos.stub'

const cosmosMessage = new CosmosSendMessage(
  'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6',
  'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6',
  [new CosmosCoin('uatom', '2')]
)

export class CosmosTestProtocolSpec extends TestProtocolSpec {
  public name = 'Cosmos'
  public lib = createCosmosProtocol({ defaultGas: { value: '310000', unit: 'blockchain' } })
  public stub = new CosmosProtocolStub()
  public validAddresses = [
    'cosmos14nzyt8wmx4g6zkeluelukamgsh5v4xgnmeq9y4',
    'cosmos1nec60dgzcxmz7g7ufnmk54rpheztsvj0rpz6cw',
    'cosmos1f074dtttm7fztxkv9s5859583up3kygr4fdwpc',
    'cosmos144fzpepuvdftv4u4r9kq8t35ap2crruv4u3udz',
    'cosmos1mrksy0nfrqutd5qmxh070t56y232zzlu9ugj36',
    'cosmos15v50ymp6n5dn73erkqtmq0u8adpl8d3ujv2e74',
    'cosmosvaloper1kj0h4kn4z5xvedu2nd9c4a9a559wvpuvu0h6qn',
    'cosmosvaloper12w6tynmjzq4l8zdla3v4x0jt8lt4rcz5gk7zg2',
    'cosmosvaloper1648ynlpdw7fqa2axt0w2yp3fk542junl7rsvq6',
    'cosmosvaloper1s7jnk7t6yqzensdgpvkvkag022udk842qdjdtd'
  ]
  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value: '194ec0f51a1774e5192e159e7c615db6d08d761e11c2c5ac75e21e1c3af15392'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: '03df7dfe5b435f96027337e523417e07cce61aa4b9f51bb93aacbdfb54a70a28aa'
    } as PublicKey,
    addresses: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6']
  }
  public txs = [
    {
      from: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
      to: ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'],
      amount: {
        value: '2',
        unit: 'blockchain'
      } as Amount<CosmosDenom>,
      fee: {
        value: '1',
        unit: 'blockchain'
      } as Amount<CosmosDenom>,
      unsignedTx: {
        type: 'unsigned',
        ...new CosmosTransaction(
          [cosmosMessage],
          new CosmosFee([new CosmosCoin('uatom', '1')], '310000'),
          '',
          'cosmoshub-3',
          '0',
          '0'
        ).toJSON()
      } as CosmosUnsignedTransaction,
      signedTx: {
        type: 'signed',
        encoded:
          'Co0BCooBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmoKLWNvc21vczF3M21lYTlnaGZkYzNyN2F4NDVtZWhsMnRjcXc5cDB2bmxobDBwNhItY29zbW9zMXczbWVhOWdoZmRjM3I3YXg0NW1laGwydGNxdzlwMHZubGhsMHA2GgoKBXVhdG9tEgEyEmIKTgpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQPfff5bQ1+WAnM35SNBfgfM5hqkufUbuTqsvftUpwooqhIECgIIARIQCgoKBXVhdG9tEgExEPD1EhpAVZB7sqYkqBNne0OpaJZ9ylXOCulitm3VwYu5D+6ZPslEWkarEYUxPp3xFlUMA+rwD0n6zzo5D/bxoGvezMs0NQ=='
      } as CosmosSignedTransaction
    }
  ]
  public validRawTransactions: any[] = [
    new CosmosTransaction(
      [
        new CosmosSendMessage('cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6', 'cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6', [
          new CosmosCoin('uatom', '2')
        ])
      ],
      new CosmosFee([new CosmosCoin('uatom', '1')], '310000'),
      '',
      'cosmoshub-3',
      '0',
      '0'
    )
  ]
  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = []

  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = []

  public validSignedTransactions: CosmosSignedTransaction[] = []

  public messages = [
    {
      message: 'example message',
      signature: {
        format: 'hex',
        value:
          '0x849eed49b0baaee51bcc9b62f95616856c1aefa3e40fab315db05d397cf064822028a1d0b7c04d1c60372dae7134ed453b3707977805edd21c108a311baad06c'
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '047e5af00e417b238dcd4e242ab19979143ee480b819aab6cc7e2e8ac34c9aa1980901a1ceef1f4702ce2615bf3dd43889890885596a5ecc59f257548b707ff980846f631845d132ea522b65f647ceef576cc942653034621a071790fffb864e2731d22219069ae0cb2d8825087d223c'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '3efdb8f9bbeb8ec879d6716a8a3f39d1!149c7f768d53e31f9ca4a6253c4599!1434b649dd17124fc8ebdc05ef50da48'
    }
  ]

  public transactionList(address: string): {
    first: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }
    next: { sender: CosmosPagedSendTxsResponse; recipient: CosmosPagedSendTxsResponse }
  } {
    const firstSender: CosmosPagedSendTxsResponse = {
      txs: [
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: address,
                to_address: 'cosmos1g7cpvdyw04zqgwze30zud36l9kurat7pzhp4ud',
                amount: [
                  {
                    denom: 'uatom',
                    amount: '10000'
                  }
                ]
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '500'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        },
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: address,
                to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                amount: [
                  {
                    denom: 'uatom',
                    amount: '100'
                  }
                ]
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '500'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        }
      ],
      tx_responses: [
        {
          height: '9016788',
          txhash: '6C5EA2BB94AD72B41B81F1683F80E77CD17F9A891CB84959E4D71E6F2568622D',
          codespace: '',
          code: 0,
          data: '0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '61473',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.bank.v1beta1.MsgSend',
                  from_address: address,
                  to_address: 'cosmos1g7cpvdyw04zqgwze30zud36l9kurat7pzhp4ud',
                  amount: [
                    {
                      denom: 'uatom',
                      amount: '10000'
                    }
                  ]
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '5000'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2022-01-10T12:46:00Z',
          events: [
            /* not relevant */
          ]
        },
        {
          height: '7494311',
          txhash: '9B570BE382821AAD363394E244D6214D3722BAC88B68E9F0DE80963B92BB9C8D',
          codespace: '',
          code: 0,
          data: '0A060A0473656E64',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '61483',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.bank.v1beta1.MsgSend',
                  from_address: address,
                  to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                  amount: [
                    {
                      denom: 'uatom',
                      amount: '100'
                    }
                  ]
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '500'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2021-08-31T08:31:01Z',
          events: [
            /* not relevant */
          ]
        }
      ],
      pagination: {
        next_key: null
      },
      total: '4'
    }

    const firstRecipient: CosmosPagedSendTxsResponse = {
      txs: [
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
                delegator_address: address,
                validator_address: 'cosmosvaloper1n3f5lm7xtlrp05z9ud2xk2cnvk2xnzkm2he6er'
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '500'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        },
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: address,
                to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                amount: [
                  {
                    denom: 'uatom',
                    amount: '1'
                  }
                ]
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '200'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        }
      ],
      tx_responses: [
        {
          height: '9779677',
          txhash: '0EBB076F7456CC4E77A9A96233E88645CEFF1876EF222DCFB09D388B952BC5D6',
          codespace: '',
          code: 0,
          data: '0A390A372F636F736D6F732E646973747269627574696F6E2E763162657461312E4D7367576974686472617744656C656761746F72526577617264',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '103678',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
                  delegator_address: address,
                  validator_address: 'cosmosvaloper1n3f5lm7xtlrp05z9ud2xk2cnvk2xnzkm2he6er'
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '500'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2022-03-17T07:34:04Z',
          events: [
            /* not relevant */
          ]
        },
        {
          height: '8718669',
          txhash: 'D0332FD8C620AE1B5DAAFC8005B30D7D56802F207561B9F4BADD1B02AAD2349E',
          codespace: '',
          code: 0,
          data: '0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '61684',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.bank.v1beta1.MsgSend',
                  from_address: address,
                  to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                  amount: [
                    {
                      denom: 'uatom',
                      amount: '1'
                    }
                  ]
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '200'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2021-12-16T17:39:26Z',
          events: [
            /* not relevant */
          ]
        }
      ],
      pagination: {
        next_key: null
      },
      total: '4'
    }

    const nextSender: CosmosPagedSendTxsResponse = {
      txs: [
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: address,
                to_address: 'cosmos1g7cpvdyw04zqgwze30zud36l9kurat7pzhp4ud',
                amount: [
                  {
                    denom: 'uatom',
                    amount: '10000'
                  }
                ]
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '500'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        },
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: address,
                to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                amount: [
                  {
                    denom: 'uatom',
                    amount: '100'
                  }
                ]
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '500'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        }
      ],
      tx_responses: [
        {
          height: '9016788',
          txhash: '6C5EA2BB94AD72B41B81F1683F80E77CD17F9A891CB84959E4D71E6F2568622D',
          codespace: '',
          code: 0,
          data: '0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '61473',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.bank.v1beta1.MsgSend',
                  from_address: address,
                  to_address: 'cosmos1g7cpvdyw04zqgwze30zud36l9kurat7pzhp4ud',
                  amount: [
                    {
                      denom: 'uatom',
                      amount: '10000'
                    }
                  ]
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '5000'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2022-01-10T12:46:00Z',
          events: [
            /* not relevant */
          ]
        },
        {
          height: '7494311',
          txhash: '9B570BE382821AAD363394E244D6214D3722BAC88B68E9F0DE80963B92BB9C8D',
          codespace: '',
          code: 0,
          data: '0A060A0473656E64',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '61483',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.bank.v1beta1.MsgSend',
                  from_address: address,
                  to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                  amount: [
                    {
                      denom: 'uatom',
                      amount: '100'
                    }
                  ]
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '500'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2021-08-31T08:31:01Z',
          events: [
            /* not relevant */
          ]
        }
      ],
      pagination: {
        next_key: null
      },
      total: '4'
    }

    const nextRecipient: CosmosPagedSendTxsResponse = {
      txs: [
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
                delegator_address: address,
                validator_address: 'cosmosvaloper1n3f5lm7xtlrp05z9ud2xk2cnvk2xnzkm2he6er'
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '500'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        },
        {
          body: {
            messages: [
              {
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: address,
                to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                amount: [
                  {
                    denom: 'uatom',
                    amount: '1'
                  }
                ]
              }
            ],
            memo: '',
            timeout_height: '0',
            extension_options: [],
            non_critical_extension_options: []
          },
          auth_info: {
            signer_infos: [
              /* not relevant */
            ],
            fee: {
              amount: [
                {
                  denom: 'uatom',
                  amount: '200'
                }
              ],
              gas_limit: '310000',
              payer: '',
              granter: ''
            }
          },
          signatures: [
            /* not relevant */
          ]
        }
      ],
      tx_responses: [
        {
          height: '9779677',
          txhash: '0EBB076F7456CC4E77A9A96233E88645CEFF1876EF222DCFB09D388B952BC5D6',
          codespace: '',
          code: 0,
          data: '0A390A372F636F736D6F732E646973747269627574696F6E2E763162657461312E4D7367576974686472617744656C656761746F72526577617264',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '103678',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
                  delegator_address: address,
                  validator_address: 'cosmosvaloper1n3f5lm7xtlrp05z9ud2xk2cnvk2xnzkm2he6er'
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '500'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2022-03-17T07:34:04Z',
          events: [
            /* not relevant */
          ]
        },
        {
          height: '8718669',
          txhash: 'D0332FD8C620AE1B5DAAFC8005B30D7D56802F207561B9F4BADD1B02AAD2349E',
          codespace: '',
          code: 0,
          data: '0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64',
          raw_log: '[]',
          logs: [
            /* not relevant */
          ],
          info: '',
          gas_wanted: '310000',
          gas_used: '61684',
          tx: {
            '@type': '/cosmos.tx.v1beta1.Tx',
            body: {
              messages: [
                {
                  '@type': '/cosmos.bank.v1beta1.MsgSend',
                  from_address: address,
                  to_address: 'cosmos1e6q8nm5uzaansf3ajhgxc9rep37qtjfrw3lyf7',
                  amount: [
                    {
                      denom: 'uatom',
                      amount: '1'
                    }
                  ]
                }
              ],
              memo: '',
              timeout_height: '0',
              extension_options: [],
              non_critical_extension_options: []
            },
            auth_info: {
              signer_infos: [
                /* not relevant */
              ],
              fee: {
                amount: [
                  {
                    denom: 'uatom',
                    amount: '200'
                  }
                ],
                gas_limit: '310000',
                payer: '',
                granter: ''
              }
            },
            signatures: [
              /* not relevant */
            ]
          },
          timestamp: '2021-12-16T17:39:26Z',
          events: [
            /* not relevant */
          ]
        }
      ],
      pagination: {
        next_key: null
      },
      total: '4'
    }

    return {
      first: { sender: firstSender, recipient: firstRecipient },
      next: { sender: nextSender, recipient: nextRecipient }
    }
  }
}
