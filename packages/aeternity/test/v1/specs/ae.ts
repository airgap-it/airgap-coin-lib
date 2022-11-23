import { Amount, SecretKey, PublicKey, Signature } from '@airgap/module-kit'
import { AeternitySignedTransaction, AeternityUnits, AeternityUnsignedTransaction, createAeternityProtocol } from '../../../src/v1'

import { TestProtocolSpec } from '../implementations'
import { AeternityProtocolStub } from '../stubs/ae.stub'

// Test Mnemonic:
// mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy
// Entropy: 8725875337f79aab564bbe866e4db739ad37a3930923f2d24289edfc4973a9c2
// Private Key: 65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196
// Public Key: d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9
// Fingerprint: 9c4c44d5
// HEX Seed: a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c

export class AeternityTestProtocolSpec extends TestProtocolSpec {
  public name = 'Aeternity'
  public lib = createAeternityProtocol()
  public stub = new AeternityProtocolStub()
  public validAddresses = [
    'ak_542o93BKHiANzqNaFj6UurrJuDuxU61zCGr9LJCwtTUg34kWt',
    'ak_hb4E2MwjH8vYctr3cimoSHfg8Hg8NdWYQfpGhprKdaurRbNfi',
    'ak_72TjHqojjETdkDTcERaTo2cgtXxCiNPL4dD3ZZjvFuS1VB7Xk',
    'ak_BPr8M9Uh4HLJgShZTR3Gmjk524MtH6duCXyTLy9E3D6PWs5q7',
    'ak_JRnrp9AvFUX5neTSHhU5tfnfd22uRc5HsmH3APXkZqC8QsNvw',
    'ak_BQJzP7iTnfCKe8vWhDtPNvXqC6TiKf59oPkLuHMqRMqqBWZ3a',
    'ak_DMNhUVW7xpNFFhs3pAwMzBeV8Q1o6tm57i1UdaxdRAQs39b8p',
    'ak_2P9fjzQeSbMwfRyCPUhXos8oG3mm8B5YJn2vpuR6hNwFf2BRdb',
    'ak_23Zr8vMCLxcMbFzvwv5pTePVeDHgXPzV2TCaLSS51NrTy5W91L',
    'ak_2cxpdq6npukgL2x5pm56Q6rqrE2BfQ1Kd62JxZioMJeKg3LP3T',
    'ak_27SFwPeBrgWaXnVgr51nKTN21DJq8B7jPeZ8oC59koEEnrmkSc'
  ]
  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value:
        '65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9'
    } as PublicKey,
    addresses: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7']
  }
  public txs = [
    {
      /*
        HEX of Unsigned TX includes:
        sender_id: 'ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7',
        recipient_id: 'ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7',
        amount: 10,
        fee: 1,
        ttl: ? (maybe 1000),
        payload: ''
      */
      to: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
      from: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
      amount: { value: '10000000000000000000', unit: 'blockchain' } as Amount<AeternityUnits>,
      fee: { value: '1000000000000000000', unit: 'blockchain' } as Amount<AeternityUnits>,
      unsignedTx: {
        type: 'unsigned',
        transaction:
          'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
        networkId: 'ae_mainnet'
      } as AeternityUnsignedTransaction,
      signedTx: {
        type: 'signed',
        transaction:
          'tx_+KULAfhCuEBokDCnOXkU2G+pwrNXVQetMO1+2fQsnOeJKGcRl1S5toQAJRldCQb1VSkmF2yumQl11kmF2H6LpAH1npP71i0OuF34WwwBoQHWT2HsVlGefxDzWQjED3syiPs+vcD2xQSqlex4Djx/+aEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mIiscjBInoAACIDeC2s6dkAAAAAIAxkWE6'
      } as AeternitySignedTransaction
    }
  ]

  public seed(): string {
    return 'a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c'
  }

  public mnemonic(): string {
    return 'mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy'
  }

  public invalidUnsignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'transaction',
      testName: 'Transaction',
      values: [
        {
          value: '0x0',
          expectedError: [' invalid tx format']
        }, // TODO: Valid?
        {
          value: '',
          expectedError: [" can't be blank", ' invalid tx format']
        },
        {
          value: 0x0,
          expectedError: [' is not of type "String"', " isn't base64 encoded"]
        },
        {
          value: 1,
          expectedError: [' is not of type "String"', " isn't base64 encoded"]
        },
        {
          value: -1,
          expectedError: [' is not of type "String"', " isn't base64 encoded"]
        },
        {
          value: undefined,
          expectedError: [" can't be blank"]
        },
        {
          value: null,
          expectedError: [" can't be blank"]
        }
      ]
    }
  ]

  public invalidSignedTransactionValues: { property: string; testName: string; values: { value: any; expectedError: any }[] }[] = [
    {
      property: 'transaction',
      testName: 'Transaction',
      values: [
        {
          value: '0x0',
          expectedError: [' invalid tx format']
        }, // TODO: Valid?
        {
          value: '',
          expectedError: [" can't be blank", ' invalid tx format']
        },
        {
          value: 0x0,
          expectedError: [' is not of type "String"', " isn't base64 encoded"]
        },
        {
          value: 1,
          expectedError: [' is not of type "String"', " isn't base64 encoded"]
        },
        {
          value: -1,
          expectedError: [' is not of type "String"', " isn't base64 encoded"]
        },
        {
          value: undefined,
          expectedError: [" can't be blank"]
        },
        {
          value: null,
          expectedError: [" can't be blank"]
        }
      ]
    },
    {
      property: 'accountIdentifier',
      testName: 'Account identifier',
      values: [
        {
          value: '0x0',
          expectedError: [' not a valid Aeternity account']
        },
        {
          value: '',
          expectedError: [" can't be blank", ' not a valid Aeternity account']
        },
        {
          value: 0x0,
          expectedError: [' is not of type "String"', ' not a valid Aeternity account']
        },
        {
          value: 1,
          expectedError: [' is not of type "String"', ' not a valid Aeternity account']
        },
        {
          value: -1,
          expectedError: [' is not of type "String"', ' not a valid Aeternity account']
        },
        {
          value: null,
          expectedError: [" can't be blank"]
        },
        {
          value: undefined,
          expectedError: [" can't be blank"]
        }
      ]
    }
  ]
  public validRawTransactions: AeternityUnsignedTransaction[] = [
    {
      type: 'unsigned',
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }
  ]

  public validSignedTransactions: AeternitySignedTransaction[] = [
    {
      type: 'signed',
      transaction:
        'tx_+KULAfhCuEBokDCnOXkU2G+pwrNXVQetMO1+2fQsnOeJKGcRl1S5toQAJRldCQb1VSkmF2yumQl11kmF2H6LpAH1npP71i0OuF34WwwBoQHWT2HsVlGefxDzWQjED3syiPs+vcD2xQSqlex4Djx/+aEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mIiscjBInoAACIDeC2s6dkAAAAAIAxkWE6'
    }
  ]

  public messages = [
    {
      message: 'example message',
      signature: {
        format: 'hex',
        value:
          '8f1c4ab15b7e26a602e711fe58d55636423790ffbeb50bfbd48d9277ddac918d9941f731c0b537d8c126686a64a93c54b32001158951e981de33b7431798860b'
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted:
        '82dd0e57687055051fd37f23e3258ffadcf6d11852d73ed4bfd424042ef0de354cd258753716009226f97105902debf679726ebd4e4dfa6a3b24384f69db8b'
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '2a879823564ba9fad11c244490460b3a!01485f7509c725c7ba037b01227cb0!aa2e42f1d02675091659a0735f2a1dea'
    }
  ]

  public transactionList(
    address: string
  ): {
    first: { data: any[]; next: string; prev: null }
    next: { data: any[]; next: null; prev: string }
  } {
    const first = {
      data: [
        {
          block_hash: 'mh_GJKQ6KqvaDUyzGfyexKPSd7tykLu3dGYLYh4HNDkSeRBPpKoL',
          block_height: 680012,
          hash: 'th_2N8cRq5WmWXQ9gXTQ7BUqEivtBPzC32SCjEK3rczpevBEgLRGN',
          micro_index: 15,
          micro_time: 1667516642582,
          signatures: ['sg_JW77dFgXuh3qUZbZts4GdMiYRjWPcbiFMBr7aqS5CTStXEMpmqzdXFjrwBqVXGXj1JgZiyiMtoGbXDoX83RUwfRk7J4UA'],
          tx: {
            amount: 1000000000000000000,
            fee: 19700000000000,
            nonce: 81,
            payload: 'ba_Xfbg4g==',
            recipient_id: address,
            sender_id: address,
            type: 'SpendTx',
            version: 1
          },
          tx_index: 35433068
        },
        {
          block_hash: 'mh_FHrZv7w1oQBS4cpkJcGYFXD9aVxPedifdmNLcJ8aznLqFAyVs',
          block_height: 546605,
          hash: 'th_DicfMSjM9TR3vwrXBVXtLgYkJAW5CwivkdDbaqJijzEf3qkUT',
          micro_index: 47,
          micro_time: 1642589502651,
          signatures: ['sg_Ad3F77JziqK3bNJeCUydv3dBrZdbFcUS5uXzE41Pb4JPThnwAkNyU3N1rjKQjp29hkoLUspuLihpstqiH4TmUSBoVc61i'],
          tx: {
            amount: 100000000000000000,
            fee: 19700000000000,
            nonce: 80,
            payload: 'ba_Xfbg4g==',
            recipient_id: address,
            sender_id: address,
            type: 'SpendTx',
            version: 1
          },
          tx_index: 29607587
        }
      ],
      next: `/txs/backward?account=${address}&cursor=29432141&limit=2`,
      prev: null
    }

    const next = {
      data: [
        {
          block_hash: 'mh_ZFnVt5yJJdLkpcGW4Khjv1VQkukU9efz311yfEUmviXchheZ5',
          block_height: 543257,
          hash: 'th_2rZRuzxggftTwdJGsAWhTUDTnzv1TyaAWPhQFycrehFQdkRFHz',
          micro_index: 82,
          micro_time: 1641971665011,
          signatures: ['sg_9vUKYG19dpqsqZbpSpkLpPCVAtHpAZfpzLDw2t8VyhkZbDeNxkoaFmxpC6omVg5NKNiihfFzKjgwVvHzMuy7TfP3PgiLG'],
          tx: {
            amount: 100000000000000000,
            fee: 19700000000000,
            nonce: 79,
            payload: 'ba_Xfbg4g==',
            recipient_id: address,
            sender_id: address,
            type: 'SpendTx',
            version: 1
          },
          tx_index: 29432141
        },
        {
          block_hash: 'mh_NzQcPfYdHX4tuSkUiYZ3aUJj28jrbJamUdoVaNAt5J5NWuiPt',
          block_height: 448592,
          hash: 'th_2iJFonW2hfKr2RKzJXZtJ6npGNYaa3fQWctzenG4edEDgg1nJX',
          micro_index: 2,
          micro_time: 1624615391469,
          signatures: ['sg_KyN2AD7dCkkpcFS779h7wf9pdWHfDnR9QbQn3W6KipuSJ4dqDPhMazmMLbFn6VdLZU19229cZc9jyTScW52yBdp9i9qyZ'],
          tx: {
            amount: 10800000000000000,
            fee: 22500000000000,
            nonce: 78,
            payload: 'ba_Xfbg4g==',
            recipient_id: address,
            sender_id: address,
            type: 'SpendTx',
            version: 1
          },
          tx_index: 23448937
        }
      ],
      next: null,
      prev: `/txs/backward?account=${address}&cursor=29607587&limit=2&rev=1`
    }

    return { first, next }
  }
}
