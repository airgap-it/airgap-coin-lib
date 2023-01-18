// tslint:disable: no-object-literal-type-assertion
import { Amount, ExtendedPublicKey, ExtendedSecretKey, Signature } from '@airgap/module-kit'

import { BitcoinSignedTransaction, BitcoinUnits, BitcoinUnsignedTransaction, createBitcoinProtocol } from '../../../src/v1'
import { XPubResponse } from '../../../src/v1/types/indexer'
import { TestProtocolSpec } from '../implementations'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'

export class BitcoinProtocolSpec extends TestProtocolSpec<BitcoinSignedTransaction, BitcoinUnsignedTransaction> {
  public name = 'Bitcoin'
  public lib = createBitcoinProtocol()
  public stub = new BitcoinProtocolStub()
  public validAddresses = [
    '37XuVSEpWW4trkfmvWzegTHQt7BdktSKUs',
    '19165VoETh1ZAcwNN5pjeXgMCJbmt4rbUB',
    '3JcJdozCssqB1RUGhhZPCSCFeSAE21sep9',
    '3CzQRvFBARhR14mfL6Dcm1XgzTRnvLwhjs'
  ]
  public wallet = {
    extendedSecretKey: {
      type: 'xpriv',
      format: 'encoded',
      value: 'xprv9yzvjXeHEDMMM2x8H6btZjyVaB9YBpvR7wdqQhGAEQbsvjrQejHhPdqdMRcAE3MqdZcfrSkCGk96YVqPhFHwJqY7VxgPgmMWMehcmHdQJ5h'
    } as ExtendedSecretKey,
    extendedPublicKey: {
      type: 'xpub',
      format: 'encoded',
      value: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV'
    } as ExtendedPublicKey,
    addresses: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc']
  }
  public txs = [
    {
      from: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
      to: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'],
      amount: { value: '10', unit: 'blockchain' } as Amount<BitcoinUnits>,
      fee: { value: '27000', unit: 'blockchain' } as Amount<BitcoinUnits>,
      unsignedTx: {
        type: 'unsigned',
        ins: [
          {
            txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
            value: '10',
            vout: 0,
            address: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            derivationPath: '0/0'
          },
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: '32418989',
            vout: 0,
            address: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
            derivationPath: '1/2'
          }
        ],
        outs: [
          {
            derivationPath: '',
            recipient: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            isChange: false,
            value: '10'
          },
          {
            derivationPath: '3',
            recipient: '1KVA7HX16cef46Lpsi67v8ZV4y6bAiTmLt',
            isChange: true,
            value: '32391989'
          }
        ]
      } as BitcoinUnsignedTransaction,
      signedTx: {
        type: 'signed',
        from: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
        to: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'],
        amount: '10',
        fee: '27000',
        transaction:
          '01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006a473044022020196ef19bf59e57334f679a725d8e4ead38121d70da56ff3cb09e96fd3eef49022077f11913dc6c4feca173079578729efa814745e7baa6dce8cda668277c15501501210311a202c95426b8aafdd7b482e53a363935eb6491b8bcd8991f16abc810f68868ffffffff9d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc000000006a4730440220278602b82b439124b2bffe2e7e14ddaf1ab3ab2fc96bafcd91240c5cbffeaf5102207f27fab5172d9159af1f5ad974e73e1b8c5faffffab83ec9211d24f08cece18d012102f5ec5458a1d3ce47e87e606df057e6efdfa4c3190b492b115418376865682cacffffffff020a000000000000001976a9142dc610f6d5bfca59507d0dddb986eacfe5c3ed8b88ac3543ee01000000001976a914cac583a9ff2b5c2ac8ea3d5d0a37cc56e99d16f488ac00000000'
      } as BitcoinSignedTransaction
    }
  ]
  public validUnsignedTransactions: BitcoinUnsignedTransaction[] = [
    {
      type: 'unsigned',
      ins: [
        {
          txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
          value: '10',
          vout: 0,
          address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo', // Mainnet Address
          derivationPath: '0/0'
        },
        {
          txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
          value: '65000000',
          vout: 0,
          address: '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP',
          derivationPath: '1/3'
        }
      ],
      outs: [
        {
          recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
          isChange: false,
          value: '10'
        },
        {
          recipient: '1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC',
          isChange: true,
          value: '64973000'
        }
      ]
    }
  ]

  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'ins',
      testName: 'Ins',
      values: [
        // not a valid txId

        {
          value: [
            {
              txId: '0x',
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },
        {
          value: [
            {
              txId: '',
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },
        {
          value: [
            {
              txId: 0x0,
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },
        {
          value: [
            {
              txId: 1,
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },
        {
          value: [
            {
              txId: -1,
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },
        {
          value: [
            {
              txId: undefined,
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },
        {
          value: [
            {
              txId: null,
              value: '10',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' not a valid txId']
        },

        // value not a valid BigNumber

        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: '0x',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },

        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: '',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },
        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: 0x0,
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },
        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: 1,
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },
        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: -1,
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },
        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: undefined,
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },
        {
          value: [
            {
              txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
              value: null,
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0/0'
            }
          ],
          expectedError: [' value not a valid BigNumber']
        },

        // vout is not a number

        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: '0x0',
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' vout is not a number']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: '',
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' vout is not a number']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0x0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: undefined
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 1,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: undefined
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: -1,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' vout is not a positive value']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: undefined,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' vout is not a number']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: null,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' vout is not a number']
        },

        // not a valid bitcoin address

        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '0x',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '',
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: 0x0,
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: 1,
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: -1,
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: undefined,
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: null,
              derivationPath: '1/3'
            }
          ],
          expectedError: [' not a valid bitcoin address']
        },

        // TODO check for derivation paths

        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: '0x'
            }
          ],
          expectedError: [' invalid derivation path']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: ''
            }
          ],
          expectedError: [' invalid derivation path']
        },

        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: 0x0
            }
          ],
          expectedError: [' invalid derivation path']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: 1
            }
          ],
          expectedError: [' invalid derivation path']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: -1
            }
          ],
          expectedError: [' invalid derivation path']
        },
        {
          value: [
            {
              txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
              value: '65000000',
              vout: 0,
              address: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              derivationPath: undefined
            }
          ],
          expectedError: [' invalid derivation path']
        }
      ]
    },
    {
      property: 'outs',
      testName: 'Outs',
      values: [
        // invalid Bitcoin address
        {
          value: [
            {
              recipient: '0x0',
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: '',
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: 0x0,
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: 1,
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: -1,
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: undefined,
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: null,
              isChange: false,
              value: '10'
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },

        // change is not a boolean

        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: '0x0',
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: '',
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: 0x0,
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: 1,
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: -1,
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: undefined,
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: null,
              value: '10'
            }
          ],
          expectedError: [' change is not a boolean']
        },

        // value is not BigNumber

        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: '0x0'
            }
          ],
          expectedError: [' value is not BigNumber']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: ''
            }
          ],
          expectedError: [' value is not BigNumber']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: 0x0
            }
          ],
          expectedError: [' value is not BigNumber']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: 1
            }
          ],
          expectedError: [' value is not BigNumber']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: -1
            }
          ],
          expectedError: [' value is not BigNumber']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: undefined
            }
          ],
          expectedError: [' value is not BigNumber']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: true,
              value: null
            }
          ],
          expectedError: [' value is not BigNumber']
        }
      ]
    }
  ]

  public validSignedTransactions: BitcoinSignedTransaction[] = [
    {
      type: 'signed',
      from: ['3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33', '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP'],
      to: [],
      amount: '1008',
      fee: '27000',
      transaction:
        '01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006b483045022100b08a74de56349455c7444acd4eba9e46aa4777eb4925203ba601f5d8765304e202205cafd944b3c92add0ed38a9603e19bac938e9bec6490b33d82d4b36d615df8210121024fd3380540fcc9ca541259ecbdf1b6c649d2be04f76d17d685ab63a8e75c4b0effffffffac6e065cabe8932e1accef482ccaebab8947b53e7e4963d4c5c722d26f57abe7000000006b483045022100d589a6c9a3c8cc4f7d05600b7d5e8a37ab7482671bc0d889671ab420fa2359210220635944edcea9947b7e40396ae41d1f0853deeef8f576a4112ace3366fe1b6453012102f75fcf06cbe5726214e6199dd7720230083fd3c4f5a984c209373684b1e010feffffffff020a000000000000001976a9141b6d966bb9c605b984151da9bed896145698c44288acc868df03000000001976a9143c95ddf9b6baf3086f3880b15900b21d970ddc9d88ac00000000'
    }
  ]
  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'from',
      testName: 'From',
      values: [
        {
          value: ['3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33', '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP'],
          expectedError: undefined
        }
        // {
        //   value: '0x0',
        //   expectedError: [" can't be blank", ' not a valid Bitcoin account']
        // } // TODO: Valid?
        // {
        //   value: '',
        //   expectedError: [" can't be blank", ' invalid tx format']
        // },
        // {
        //   value: 0x0,
        //   expectedError: [' is not of type "String"', " isn't base64 encoded"]
        // },
        // {
        //   value: 1,
        //   expectedError: [' is not of type "String"', " isn't base64 encoded"]
        // },
        // {
        //   value: -1,
        //   expectedError: [' is not of type "String"', " isn't base64 encoded"]
        // },
        // {
        //   value: undefined,
        //   expectedError: [" can't be blank"]
        // },
        // {
        //   value: null,
        //   expectedError: [" can't be blank"]
        // }
      ]
    }
  ]

  public messages = [
    {
      message: 'example message',
      signature: {
        format: 'encoded',
        value: 'IBktb5pV1sOtX15/qK8IyocO0i1Bbxf+v+ZqCryg477QVYykBA4U4iXcpgjfJwagHi+OaXXpOStd8v86VVp87j0='
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '04304d211a7dd38b49e8bddf0c5b28f813f398927effab15e394c8bb21801003fd7f2e2846d09325c04b8f979f133d75e32f73f3faca761305fa01c021d931e901b9989df63b2845d87de830696311bc73b19997aee66ed129a92745d1714c0734d7171f15af3e64a1f62be46a455b9c'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '0d19df9aa03a6b1f743f87f3b76031fb!5b1912552bf8f16ebc6cd038c2813a!249df7a0583417db3f02bd934084d2fa'
    }
  ]

  public transactionList(xpub: string): { first: XPubResponse; next: XPubResponse } {
    const first: XPubResponse = {
      page: 1,
      totalPages: 2,
      itemsOnPage: 2,
      address: xpub,
      balance: '260279',
      totalReceived: '1911697',
      totalSent: '1651418',
      unconfirmedBalance: '0',
      unconfirmedTxs: 0,
      txs: 3,
      transactions: [
        {
          txid: 'a8250db2926a58f1789db8e0bd0ee0ef3eed1e12029baee091e3a095c1ce275a',
          version: 1,
          vin: [
            {
              txid: '2f14240cd23604c352ee0a6924d46e537daa4e2c5411df6e4109b0f673643ea4',
              vout: 1,
              sequence: 4294967295,
              n: 0,
              addresses: ['18nZGL714Ru5ggE4fxoWRGjwA3oRayRAAc'],
              isAddress: true,
              isOwn: true,
              value: '298383',
              hex:
                '47304402206c12c9c08bfd06e44587341e04b896e1d2148ccb7a38596a43b0f96f44d95fcb0220631db7c1a388eae32ba6a77b736e16ad5e6f319956c6dd8055eed60fc23686da0121029cb3c9cf3df791086f62844fa8afc1ab2ea1b9be6c010a92b07c5119c3192196'
            }
          ],
          vout: [
            {
              value: '50000',
              n: 0,
              spent: true,
              hex: '00145767bf963179b8bbe1635623d097cde2cd138fd7',
              addresses: ['bc1q2anml9330xuthctr2c3ap97dutx38r7hnfu8kr'],
              isAddress: true
            },
            {
              value: '246279',
              n: 1,
              hex: '76a91455f57221190ea0db39bb6bbdf66a1c1f754b262a88ac',
              addresses: ['18qWUBSPpoWSEb4GjJEZPiWLqGtYgwNznY'],
              isAddress: true,
              isOwn: true
            }
          ],
          blockHash: '0000000000000000000566dc611ec8175a312afce07a9d02921c0e300969fb75',
          blockHeight: 733671,
          confirmations: 30847,
          blockTime: 1650989179,
          value: '296279',
          valueIn: '298383',
          fees: '2104',
          hex:
            '0100000001a43e6473f6b009416edf11542c4eaa7d536ed424690aee52c30436d20c24142f010000006a47304402206c12c9c08bfd06e44587341e04b896e1d2148ccb7a38596a43b0f96f44d95fcb0220631db7c1a388eae32ba6a77b736e16ad5e6f319956c6dd8055eed60fc23686da0121029cb3c9cf3df791086f62844fa8afc1ab2ea1b9be6c010a92b07c5119c3192196ffffffff0250c30000000000001600145767bf963179b8bbe1635623d097cde2cd138fd707c20300000000001976a91455f57221190ea0db39bb6bbdf66a1c1f754b262a88ac00000000'
        },
        {
          txid: '2f14240cd23604c352ee0a6924d46e537daa4e2c5411df6e4109b0f673643ea4',
          version: 1,
          vin: [
            {
              txid: '9b483fba71dfa83201483369dd0de8a5a4597879bb161fc998da85f4841f5473',
              vout: 1,
              sequence: 4294967295,
              n: 0,
              addresses: ['1BQEKFQMt3gnBxWsTFaB1a6n54CiL9LkJv'],
              isAddress: true,
              isOwn: true,
              value: '301518',
              hex:
                '47304402203e2de60e78b3ef4e48903c0fa04cd326eaed558373a957134138767c6fe889080220323dad6adf16f2c3be2c403eabe0aeee57b8142c024e5c4bfea8fb2d7ae6d7d8012102d249e8e145cd3440961a084face27238af7f1db8a6a960b04a1796d7479785f7'
            }
          ],
          vout: [
            {
              value: '900',
              n: 0,
              spent: true,
              hex: '001426c70090845e753c68feb48056e8aad40fed64de',
              addresses: ['bc1qymrspyyyte6nc687kjq9d6926s876ex7k5u3p3'],
              isAddress: true
            },
            {
              value: '298383',
              n: 1,
              spent: true,
              hex: '76a9145566881a12a4b061855a920280ecc907697b325088ac',
              addresses: ['18nZGL714Ru5ggE4fxoWRGjwA3oRayRAAc'],
              isAddress: true,
              isOwn: true
            }
          ],
          blockHash: '00000000000000000006d646e14c071cb6ce38e9e1bcf52ad4fb021aa6992e1a',
          blockHeight: 707092,
          confirmations: 57426,
          blockTime: 1635419944,
          value: '299283',
          valueIn: '301518',
          fees: '2235',
          hex:
            '010000000173541f84f485da98c91f16bb797859a4a5e80ddd6933480132a8df71ba3f489b010000006a47304402203e2de60e78b3ef4e48903c0fa04cd326eaed558373a957134138767c6fe889080220323dad6adf16f2c3be2c403eabe0aeee57b8142c024e5c4bfea8fb2d7ae6d7d8012102d249e8e145cd3440961a084face27238af7f1db8a6a960b04a1796d7479785f7ffffffff02840300000000000016001426c70090845e753c68feb48056e8aad40fed64de8f8d0400000000001976a9145566881a12a4b061855a920280ecc907697b325088ac00000000'
        }
      ]
    }

    const next: XPubResponse = {
      page: 2,
      totalPages: 2,
      itemsOnPage: 10,
      address: xpub,
      balance: '260279',
      totalReceived: '1911697',
      totalSent: '1651418',
      unconfirmedBalance: '0',
      unconfirmedTxs: 0,
      txs: 3,
      transactions: [
        {
          txid: '9b483fba71dfa83201483369dd0de8a5a4597879bb161fc998da85f4841f5473',
          version: 1,
          vin: [
            {
              txid: '89bd7f15259ba64efc8425c62988c5d773bac0e0116343a9b420157391ad9963',
              vout: 1,
              sequence: 4294967295,
              n: 0,
              addresses: ['1ByRdzRff99FoaacPkBkLxxNb4pLM3jfk7'],
              isAddress: true,
              isOwn: true,
              value: '335957',
              hex:
                '4730440220248586117c9596be377a2c682b4915b007308785b45d8293c6fb278ce74baf98022001fa5d69c7223d50e94d9b792457187c7e931bd42f95ab82252e9bebf0017b420121033b1694fe454fd7aaffe825856fb43fcb9bb681a0f71bbd17494d286a321d0a53'
            }
          ],
          vout: [
            {
              value: '30000',
              n: 0,
              spent: true,
              hex: 'a9147cb88274f1b48e74d69f7a18a51bce6c6007439e87',
              addresses: ['3D4UkHKokagbaDJ8toLwVDvy2r8xkbPG3C'],
              isAddress: true
            },
            {
              value: '301518',
              n: 1,
              spent: true,
              hex: '76a9147215f07fbe64128d515b503c74a8cc532a6de47c88ac',
              addresses: ['1BQEKFQMt3gnBxWsTFaB1a6n54CiL9LkJv'],
              isAddress: true,
              isOwn: true
            }
          ],
          blockHash: '0000000000000000000adda86985b0f2425a087d0e63c78b4d97d5c0bcff9e70',
          blockHeight: 703490,
          confirmations: 61028,
          blockTime: 1633343748,
          value: '331518',
          valueIn: '335957',
          fees: '4439',
          hex:
            '01000000016399ad91731520b4a9436311e0c0ba73d7c58829c62584fc4ea69b25157fbd89010000006a4730440220248586117c9596be377a2c682b4915b007308785b45d8293c6fb278ce74baf98022001fa5d69c7223d50e94d9b792457187c7e931bd42f95ab82252e9bebf0017b420121033b1694fe454fd7aaffe825856fb43fcb9bb681a0f71bbd17494d286a321d0a53ffffffff02307500000000000017a9147cb88274f1b48e74d69f7a18a51bce6c6007439e87ce990400000000001976a9147215f07fbe64128d515b503c74a8cc532a6de47c88ac00000000'
        }
      ]
    }

    return { first, next }
  }
}
