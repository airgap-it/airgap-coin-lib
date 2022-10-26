import { AirGapWalletStatus } from '@airgap/coinlib-core/wallet/AirGapWallet'
import { AeternityTransactionValidator } from '../../../serializer/src/v3/unsigned-transactions/aeternity-transactions.validator'
import { RawAeternityTransaction, SignedAeternityTransaction } from '../../src'

import { AeternityProtocol } from '../../src/protocol/AeternityProtocol'
import { TestProtocolSpec } from '../implementations'
import { AeternityProtocolStub } from '../stubs/ae.stub'

// Test Mnemonic:
// mango club state husband keen fiber float jelly major include horse infant square spike equip caught version must pen swim setup right poem economy
// Entropy: 8725875337f79aab564bbe866e4db739ad37a3930923f2d24289edfc4973a9c2
// Private Key: 65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196
// Public Key: d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9
// Fingerprint: 9c4c44d5
// HEX Seed: a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c

export class AETestProtocolSpec extends TestProtocolSpec {
  public name = 'Aeternity'
  public lib = new AeternityProtocol()
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
    privateKey:
      '65093ac9899ced07211b56eaef83c2fdfef11ecea77a665d2d59cf93c40e5196d64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    publicKey: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
    addresses: ['ak_2dPGHd5dZgKwR234uqPZcAXXcCyxr3TbWwgV8NSnNincth4Lf7'],
    masterFingerprint: '9c4c44d5',
    status: AirGapWalletStatus.ACTIVE
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
      amount: '10000000000000000000',
      fee: '1000000000000000000',
      unsignedTx: {
        transaction:
          'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
        networkId: 'ae_mainnet'
      },
      signedTx:
        'tx_+KULAfhCuEBokDCnOXkU2G+pwrNXVQetMO1+2fQsnOeJKGcRl1S5toQAJRldCQb1VSkmF2yumQl11kmF2H6LpAH1npP71i0OuF34WwwBoQHWT2HsVlGefxDzWQjED3syiPs+vcD2xQSqlex4Djx/+aEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mIiscjBInoAACIDeC2s6dkAAAAAIAxkWE6'
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
  public validRawTransactions: RawAeternityTransaction[] = [
    {
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }
  ]

  public validSignedTransactions: SignedAeternityTransaction[] = [
    {
      accountIdentifier: 'd64f61ec56519e7f10f35908c40f7b3288fb3ebdc0f6c504aa95ec780e3c7ff9',
      transaction:
        'tx_+KULAfhCuEBokDCnOXkU2G+pwrNXVQetMO1+2fQsnOeJKGcRl1S5toQAJRldCQb1VSkmF2yumQl11kmF2H6LpAH1npP71i0OuF34WwwBoQHWT2HsVlGefxDzWQjED3syiPs+vcD2xQSqlex4Djx/+aEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mIiscjBInoAACIDeC2s6dkAAAAAIAxkWE6'
    }
  ]

  public validator: AeternityTransactionValidator = new AeternityTransactionValidator()

  public messages = [
    {
      message: 'example message',
      signature:
        '8f1c4ab15b7e26a602e711fe58d55636423790ffbeb50bfbd48d9277ddac918d9941f731c0b537d8c126686a64a93c54b32001158951e981de33b7431798860b'
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

  public transactionResult = {
    transactions: [
      {
        amount: '5463861640000000000',
        fee: '40000000000000',
        from: ['ak_542o93BKHiANzqNaFj6UurrJuDuxU61zCGr9LJCwtTUg34kWt'],
        isInbound: false,
        protocolIdentifier: 'ae',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://ae-epoch-rpc-proxy.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://mainnet.aeternal.io' }
        },
        to: ['ak_g5NtGtyg946tfKaDmyKmknb3QvyznwmUW3v5NbpYazgXnEF48'],
        hash: 'th_8GqdPPQtcytYgSbDLUymZCdeb1BLGn6nHpehSpFntVdpnRGQt',
        blockHeight: 318929,
        data: 'ba_Xfbg4g==',
        timestamp: 1601001689
      },
      {
        amount: '5173537550000000000',
        fee: '40000000000000',
        from: ['ak_542o93BKHiANzqNaFj6UurrJuDuxU61zCGr9LJCwtTUg34kWt'],
        isInbound: false,
        protocolIdentifier: 'ae',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://ae-epoch-rpc-proxy.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://mainnet.aeternal.io' }
        },
        to: ['ak_2QtZsJwQNqs5dphXpNwSJvGXboFwK8mVGzhoV4wWv6pw3D4wK'],
        hash: 'th_2AKfgL5QigXqS4XoRJW48FWsRTgkDLSstJEvLgiFccJ5jijdHE',
        blockHeight: 318929,
        data: 'ba_Xfbg4g==',
        timestamp: 1601001689
      }
    ],
    cursor: { page: 2 }
  }

  public nextTransactionResult = {
    transactions: [
      {
        amount: '6374579630000000000',
        fee: '40000000000000',
        from: ['ak_542o93BKHiANzqNaFj6UurrJuDuxU61zCGr9LJCwtTUg34kWt'],
        isInbound: false,
        protocolIdentifier: 'ae',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://ae-epoch-rpc-proxy.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://mainnet.aeternal.io' }
        },
        to: ['ak_1Grirjn4xNChWCkuiUkiBBqBrPpR99S2VDzciDb4wy3UdCmgk'],
        hash: 'th_2PB8zHjtxcr3zVrVnsL1mXof9ryTMrfokkafCCHR8UMVLxzACt',
        blockHeight: 318928,
        data: 'ba_Xfbg4g==',
        timestamp: 1601001648
      },
      {
        amount: '6519645480000000000',
        fee: '40000000000000',
        from: ['ak_542o93BKHiANzqNaFj6UurrJuDuxU61zCGr9LJCwtTUg34kWt'],
        isInbound: false,
        protocolIdentifier: 'ae',
        network: {
          name: 'Mainnet',
          type: 'MAINNET',
          rpcUrl: 'https://ae-epoch-rpc-proxy.gke.papers.tech',
          blockExplorer: { blockExplorer: 'https://mainnet.aeternal.io' }
        },
        to: ['ak_gWvfN1TRmWTxTM3WRqzaKRPuc1zgk6aqyKQaKToDmFa2SPMhE'],
        hash: 'th_UxJEH9fG4icVVAoQXR7UrN4MBybsPhPCk4PXPs9h3uw8m9cZC',
        blockHeight: 318928,
        data: 'ba_Xfbg4g==',
        timestamp: 1601001645
      }
    ],
    cursor: { page: 3 }
  }
}
