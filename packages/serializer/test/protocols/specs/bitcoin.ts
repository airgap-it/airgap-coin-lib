import { BitcoinProtocol, RawBitcoinTransaction, SignedBitcoinTransaction } from '@airgap/bitcoin'
import { AirGapWalletStatus } from '@airgap/coinlib-core/wallet/AirGapWallet'

import { IACMessageDefinitionObject } from '../../../src'
import { BitcoinTransactionValidator } from '../../../src/v3/unsigned-transactions/bitcoin-transactions.validator'
import { TestProtocolSpec } from '../implementations'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'

export class BitcoinProtocolSpec extends TestProtocolSpec {
  public name = 'Bitcoin'
  public lib = new BitcoinProtocol()
  public stub = new BitcoinProtocolStub()
  public validAddresses = [
    '37XuVSEpWW4trkfmvWzegTHQt7BdktSKUs',
    '19165VoETh1ZAcwNN5pjeXgMCJbmt4rbUB',
    '3JcJdozCssqB1RUGhhZPCSCFeSAE21sep9',
    '3CzQRvFBARhR14mfL6Dcm1XgzTRnvLwhjs'
  ]
  public wallet = {
    privateKey: 'xprv9yzvjXeHEDMMM2x8H6btZjyVaB9YBpvR7wdqQhGAEQbsvjrQejHhPdqdMRcAE3MqdZcfrSkCGk96YVqPhFHwJqY7VxgPgmMWMehcmHdQJ5h',
    publicKey: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
    addresses: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
    masterFingerprint: '',
    status: AirGapWalletStatus.ACTIVE
  }
  public txs = [
    {
      from: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
      to: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'],
      amount: '10',
      fee: '27000',
      unsignedTx: {
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
      },
      signedTx: `01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006a473044022020196ef19bf59e57334f679a725d8e4ead38121d70da56ff3cb09e96fd3eef49022077f11913dc6c4feca173079578729efa814745e7baa6dce8cda668277c15501501210311a202c95426b8aafdd7b482e53a363935eb6491b8bcd8991f16abc810f68868ffffffff9d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc000000006a4730440220278602b82b439124b2bffe2e7e14ddaf1ab3ab2fc96bafcd91240c5cbffeaf5102207f27fab5172d9159af1f5ad974e73e1b8c5faffffab83ec9211d24f08cece18d012102f5ec5458a1d3ce47e87e606df057e6efdfa4c3190b492b115418376865682cacffffffff020a000000000000001976a9142dc610f6d5bfca59507d0dddb986eacfe5c3ed8b88ac3543ee01000000001976a914cac583a9ff2b5c2ac8ea3d5d0a37cc56e99d16f488ac00000000`
    }
  ]
  public validRawTransactions: RawBitcoinTransaction[] = [
    {
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

  public validSignedTransactions: SignedBitcoinTransaction[] = [
    {
      from: ['3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33', '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP'],
      to: [],
      amount: '1008',
      fee: '27000',
      accountIdentifier: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
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
  public validator: BitcoinTransactionValidator = new BitcoinTransactionValidator()

  public async signedTransaction(tx: any): Promise<IACMessageDefinitionObject[]> {
    const protocol: IACMessageDefinitionObject[] = await super.signedTransaction(tx)
    const payload = protocol[0].payload as SignedBitcoinTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses

    return protocol
  }

  public messages = [
    {
      message: 'example message',
      signature: 'IBktb5pV1sOtX15/qK8IyocO0i1Bbxf+v+ZqCryg477QVYykBA4U4iXcpgjfJwagHi+OaXXpOStd8v86VVp87j0='
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

  public transactionResult = {
    transactions: [
      {
        hash: 'e5785a893c7fc3adb7b5c31026cbf8abb59bab1a09989d8f4fff67963de1064b',
        from: ['1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s', '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s'],
        to: [
          '1EWYGkA7WfvJxBFwk4B4qNtjXHinbBG7Um',
          '3Qa1qpKGmBcEQXVRFhjKGdVVNhuuRKdcS4',
          '38ziQS6rVB7DCvvocswEPJkc5vH2zzg8DQ',
          '3FVhYoGQDR1qtYiLY26zvivQQNyqXb81XD',
          '12Gffh8SVQEHt1KgyuKpL9JfTe84K5k8mu',
          '3G1oSVGiB5WDDAuK4yNXFrVNRGHWHsK5aZ',
          '3AMA8TRLx7LRvgaPMXDvKS14TQrg36QijU',
          '1KPBHXiCQ9yZ2CJmLo7HpBG1vs675ivz3o',
          '1JgLnhs6eB6b5dtNEDDaX8LDzrfEzSkZVW',
          '3NiRhh4V4Pm4wCuLqLJN1NGHwVmQq7rM5z',
          '1AMaW6fzuz6Np2KB7eRrv1dSEYeffXNfn1',
          '39KoX6qxHHGcGUAooAA5a9AW6W1g5CQBKf',
          '16GGJpscpKPXeuRwWtR1HbGmKkkaVDgMq9'
        ],
        isInbound: true,
        amount: '9584316',
        fee: '79600',
        blockHeight: 649920,
        protocolIdentifier: 'btc',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://live.blockcypher.com/btc' },
          extras: {}
        },
        timestamp: 1601034739
      },
      {
        hash: '8859b4c7a8d1b5ce921301630203b3b58703c4c324fa568c73a8ea7cdfa8630d',
        from: ['3FVhYoGQDR1qtYiLY26zvivQQNyqXb81XD', '3PswdY2pgWBrbx2Eg5kmJLV3HgTBA6z2jF'],
        to: ['14sdXZcacodeg1TV992xhpXb51FnF6eJ6G', '3QpMdwyHJAiwTrap8Q4foKXso3sBSniD1t'],
        isInbound: false,
        amount: '147958402',
        fee: '4512',
        blockHeight: 620423,
        protocolIdentifier: 'btc',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://live.blockcypher.com/btc' },
          extras: {}
        },
        timestamp: 1583466141
      }
    ],
    cursor: { offset: 2 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        hash: '72df92f031ee47f75ce3e1fcf5377a844fc636e359a9338c70920ccea939a785',
        from: ['14xKAdxwvjCAyzhPZvRZRHMdpUqKbnetVD', '38nbkw1c5kVJvE6ZzuKBYdKfMQd5MYNusX', '1KT7JVS92BkRkEPWGwAD9pAgQrJKmnUR1F'],
        to: ['3HDS7wmufAvmRLfEh48CjCB2XqqHN2M3YJ', '3FVhYoGQDR1qtYiLY26zvivQQNyqXb81XD'],
        isInbound: true,
        amount: '147920000',
        fee: '1395',
        blockHeight: 617775,
        protocolIdentifier: 'btc',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://live.blockcypher.com/btc' },
          extras: {
            indexerApi: 'https://insight.bitpay.com',
            network: {
              messagePrefix: '\u0018Bitcoin Signed Message:\n',
              bech32: 'bc',
              bip32: { public: 76067358, private: 76066276 },
              pubKeyHash: 0,
              scriptHash: 5,
              wif: 128,
              coin: 'btc',
              hashFunctions: {}
            }
          }
        },
        timestamp: 1581943495
      },
      {
        hash: '1eb83fb1d61e07968bc0f5daf7c1586293df222947a1c320254da7a93babfdc7',
        from: ['31vBBCBPkCPHpCV618Lr61myaFzQs35cm8', '3FVhYoGQDR1qtYiLY26zvivQQNyqXb81XD'],
        to: ['159PiitWiC7q3wYXYx5qmPr4xcpJjjkhS5', '3PswdY2pgWBrbx2Eg5kmJLV3HgTBA6z2jF'],
        isInbound: false,
        amount: '148042914',
        fee: '8460',
        blockHeight: 617204,
        protocolIdentifier: 'btc',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: '',
          blockExplorer: { blockExplorer: 'https://live.blockcypher.com/btc' },
          extras: {}
        },
        timestamp: 1581598043
      }
    ],
    cursor: { offset: 4 }
  }
}
