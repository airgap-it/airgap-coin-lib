import { BitcoinTransactionValidator } from './../../../src/serializer/unsigned-transactions/bitcoin-transactions.validator'
import BigNumber from 'bignumber.js'

import { BitcoinProtocol, DeserializedSyncProtocol, SignedTransaction } from '../../../src'
import { TestProtocolSpec } from '../implementations'
import { BitcoinProtocolStub } from '../stubs/bitcoin.stub'
import { SignedBitcoinTransaction } from '../../../src/serializer/signed-transactions/bitcoin-transactions.serializer'
import { RawBitcoinTransaction } from '../../../src/serializer/unsigned-transactions/bitcoin-transactions.serializer'

export class BitcoinProtocolSpec extends TestProtocolSpec {
  public name = 'Bitcoin'
  public lib = new BitcoinProtocol()
  public stub = new BitcoinProtocolStub()
  public validAddresses = [
    '1NVqzkVsgWhiQmjXKmEvRiJLmyR17yFCwd',
    '19165VoETh1ZAcwNN5pjeXgMCJbmt4rbUB',
    '3JcJdozCssqB1RUGhhZPCSCFeSAE21sep9',
    '3CzQRvFBARhR14mfL6Dcm1XgzTRnvLwhjs'
  ]
  public wallet = {
    privateKey: 'xprv9yzvjXeHEDMMM2x8H6btZjyVaB9YBpvR7wdqQhGAEQbsvjrQejHhPdqdMRcAE3MqdZcfrSkCGk96YVqPhFHwJqY7VxgPgmMWMehcmHdQJ5h',
    publicKey: 'xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV',
    addresses: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc']
  }
  public txs = [
    {
      from: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi', '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc'],
      to: ['15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi'],
      amount: new BigNumber('10'),
      fee: new BigNumber('27000'),
      unsignedTx: {
        ins: [
          {
            txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
            value: new BigNumber('10'),
            vout: 0,
            address: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            derivationPath: '0/0'
          },
          {
            txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
            value: new BigNumber('32418989'),
            vout: 0,
            address: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
            derivationPath: '1/2'
          }
        ],
        outs: [
          {
            recipient: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
            isChange: false,
            value: new BigNumber('10')
          },
          {
            recipient: '18MwerXaLVrTshUSJyg8ZZAq2LhJwia9QE',
            isChange: true,
            value: new BigNumber('32391989')
          }
        ]
      },
      signedTx: `01000000027bcda7b76bc47ab562a79cb36198cefe364b66cf913426b7932e84120822108a000000006a47304402202a449911bc9c0deb77fc326fed98bd10d0d70a650bbb7e20964dfaac5ae7ca07022020c2af3ce6a6f2686f72e4fbf0ee582a14e5344d9825aec445d341931dae65d601210311a202c95426b8aafdd7b482e53a363935eb6491b8bcd8991f16abc810f68868ffffffff9d035485adbb78236f53e79bc02ff8785a3312bd3b65f94ba022d9b632b869cc000000006b483045022100f515e7d18601cf1fe263d872ead795ddf5d019c11dab0ad63d737a724bc0d82402204fdaf34ed9d2f7eb765177261b7370063a35385f2a95d685d97e9951dc6ce6b0012102f5ec5458a1d3ce47e87e606df057e6efdfa4c3190b492b115418376865682cacffffffff020a000000000000001976a9142dc610f6d5bfca59507d0dddb986eacfe5c3ed8b88ac3543ee01000000001976a91450bed24b350241ac16f72144cfa4849138013aed88ac00000000`
    }
  ]
  public validRawTransactions: Array<RawBitcoinTransaction> = [
    {
      ins: [
        {
          txId: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
          value: new BigNumber('10'),
          vout: 0,
          address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo', // Mainnet Address
          derivationPath: '0/0'
        },
        {
          txId: 'e7ab576fd222c7c5d463497e3eb54789abebca2c48efcc1a2e93e8ab5c066eac',
          value: new BigNumber('65000000'),
          vout: 0,
          address: '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP',
          derivationPath: '1/3'
        }
      ],
      outs: [
        {
          recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
          isChange: false,
          value: new BigNumber('10')
        },
        {
          recipient: '1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC',
          isChange: true,
          value: new BigNumber('64973000')
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
              value: new BigNumber('10'),
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
              value: new BigNumber('10'),
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
              value: new BigNumber('10'),
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
              value: new BigNumber('10'),
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
              value: new BigNumber('10'),
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
              value: new BigNumber('10'),
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
              value: new BigNumber('10'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('65000000'),
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
              value: new BigNumber('10')
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: '',
              isChange: false,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: 0x0,
              isChange: false,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: 1,
              isChange: false,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: -1,
              isChange: false,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: undefined,
              isChange: false,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' invalid Bitcoin address']
        },
        {
          value: [
            {
              recipient: null,
              isChange: false,
              value: new BigNumber('10')
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
              value: new BigNumber('10')
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: '',
              value: new BigNumber('10')
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: 0x0,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: 1,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: -1,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: undefined,
              value: new BigNumber('10')
            }
          ],
          expectedError: [' change is not a boolean']
        },
        {
          value: [
            {
              recipient: '3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33',
              isChange: null,
              value: new BigNumber('10')
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

  public validSignedTransactions: Array<SignedBitcoinTransaction> = [
    {
      from: ['3E35SFZkfLMGo4qX5aVs1bBDSnAuGgBH33', '385cR5DM96n1HvBDMzLHPYcw89fZAXULJP'],
      amount: new BigNumber('1008'),
      fee: new BigNumber('27000'),
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
  public validator = new BitcoinTransactionValidator()

  public signedTransaction(tx: any): DeserializedSyncProtocol {
    const protocol: DeserializedSyncProtocol = super.signedTransaction(tx)
    const payload = protocol.payload as SignedTransaction
    payload.amount = this.txs[0].amount
    payload.fee = this.txs[0].fee
    payload.from = this.wallet.addresses
    return protocol
  }
}
