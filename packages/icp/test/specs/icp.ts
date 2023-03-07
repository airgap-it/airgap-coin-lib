// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'

import { createICPProtocol, ICPProtocol, ICPSignedTransaction, ICPUnits, ICPUnsignedTransaction } from '../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { ICPProtocolStub } from '../stubs/icp.stub'

// mnemonic                :  october prison mutual save clap curtain fit dream limit guard absurd hill travel develop mix hire wet awesome avocado voyage excess seat battle dish
// public key              :  3056301006072a8648ce3d020106052b8104000a034200041bdf9a8840883856e977bb0411cdf24bc2214f4acb457c597b11e0ee8990acee9dd89412abc2d8566ef2d71dacbe95b449907edf8989d7002c779a97aebf0ca1
// private key             :  24a69f5168a28adfbd2a612289095a935dd2b34c6a7661e5667c6663945debf5
// address                 :  78a47d34778a0bb211f649b54379e6be6286ddd6f459826352ee2819564343de

export class ICPTestProtocolSpec extends TestProtocolSpec<ICPProtocol, ICPProtocol> {
  public name = 'ICP'
  public offlineLib = createICPProtocol()
  public onlineLib = createICPProtocol()
  public stub = new ICPProtocolStub()

  public mnemonic(): string {
    return 'october prison mutual save clap curtain fit dream limit guard absurd hill travel develop mix hire wet awesome avocado voyage excess seat battle dish'
  }

  // TODO: check what the seed is
  public seed(): string {
    return 'a109e38f00824ea80107cd7ccbac4e7afe7abe588eeac9191d71adf98fb1fba73311182c010a0182e20e67f4daa45bf1cbbbecab8ff407f33e50045d7d516e0c'
  }

  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value: '24a69f5168a28adfbd2a612289095a935dd2b34c6a7661e5667c6663945debf5'
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value:
        '3056301006072a8648ce3d020106052b8104000a034200041bdf9a8840883856e977bb0411cdf24bc2214f4acb457c597b11e0ee8990acee9dd89412abc2d8566ef2d71dacbe95b449907edf8989d7002c779a97aebf0ca1'
    } as PublicKey,
    addresses: ['78a47d34778a0bb211f649b54379e6be6286ddd6f459826352ee2819564343de']
  }

  public validAddresses = [
    'e994ad0378bb902896b55dd5a69a72e7fb2762bba50b32f66f77d2d99d07ac94',
    'ac8253ae2db65499dd244f6121c9ba74389690c8ff598cfe56db7dd20dcf4f0d',
    'efa01544f509c56dd85449edf2381244a48fad1ede5183836229c00ab00d52df',
    'ee3b6fff30fe33a141fa7723d6668b29193b52dff58ed8ce3d59155183d1b0fc',
    'f66ec8777c7f0401f75a0f44c60a7a277e29f7257881ac79badee1211f35c1b2',
    'aa07ff4e5ce1a38edbf30acf344fd50b09185bfadec86c68f623e4ec81f281a9',
    'b1569a59eea517235679a67be1d1df9b5a6c700656b56116e71f8e14b3f2a585',
    '871941c9bc80e6f788f185426c9c54acdf1ad572d212a48fd0cdfe3fe3beaa41',
    'e80fca75b2e9c23ba4e4f4e482df75b40446a8f744e5d2df1db0d769e2c98f52',
    'fd311a7fc09aa19bbbca22fb7f70729690ac860b881867c5e3a50c39f7b27cc3',
    '4b5a28911fe9f4f11fa76b2edf38dc1dcd790e9f5618c99e90831ecf1fcdd9a2'
  ]

  public txs = [
    {
      to: ['dcca81c1e64562935cd2a89404be2dfaaeaf80e69bd623e97ee6f75ec3277eb0'],
      from: ['78a47d34778a0bb211f649b54379e6be6286ddd6f459826352ee2819564343de'],
      amount: { value: '10000', unit: 'blockchain' } as Amount<ICPUnits>,
      fee: { value: '10000', unit: 'blockchain' } as Amount<ICPUnits>,
      unsignedTx: {
        type: 'unsigned',
        transaction:
          '4449444c066d7b6c01e0a9b302786e006c01d6f68e8001786e036c06fbca0100c6fcb60201ba89e5c20478a2de94eb060282f3f3910c04d8a38ca80d01010520dcca81c1e64562935cd2a89404be2dfaaeaf80e69bd623e97ee6f75ec3277eb01027000000000000000000000000000000001027000000000000',
        networkId: 'icp_mainnet'
      } as ICPUnsignedTransaction,
      signedTx: {
        type: 'signed',
        transaction:
          'd9d9f7a367636f6e74656e74a663617267587a4449444c066d7b6c01e0a9b302786e006c01d6f68e8001786e036c06fbca0100c6fcb60201ba89e5c20478a2de94eb060282f3f3910c04d8a38ca80d01010520dcca81c1e64562935cd2a89404be2dfaaeaf80e69bd623e97ee6f75ec3277eb010270000000000000000000000000000000010270000000000006b63616e69737465725f69644a000000000000000201016e696e67726573735f6578706972791b173ce5fba7ef1f006b6d6574686f645f6e616d65687472616e736665726c726571756573745f747970656463616c6c6673656e646572581dff201eb43d68ff776ea1d47a847167551ab6068ac352227328ded8b2026d73656e6465725f7075626b657958583056301006072a8648ce3d020106052b8104000a034200041bdf9a8840883856e977bb0411cdf24bc2214f4acb457c597b11e0ee8990acee9dd89412abc2d8566ef2d71dacbe95b449907edf8989d7002c779a97aebf0ca16a73656e6465725f7369675840cd2571915ad2f804980e8e68184b6fdab272379dd0670e2a91eb18d337f32cda32e1073d3b525638c5f912c5a270ff6801576c272fbf5f43118943f076196ef7'
      } as ICPSignedTransaction
    }
  ]

  public transactionList(
    address: string
  ): {
    first: { total: number; blocks: any[]; next: string; prev: null }
    next: { total: number; blocks: any[]; next: null; prev: string }
  } {
    const first = {
      total: 10,
      blocks: [
        {
          block_height: '5422983',
          parent_hash: '84848aa96be36b3b0ba59604d5da2954123e65fc02682e6337463a06000a8a72',
          block_hash: 'caf9bf5c47aaff53fadaf7389c135fb22d5e6abde4785714e42c373927d7f8f4',
          transaction_hash: '73e3dc746b36a435e15f8f8d72a3adbda69b9ebb5f51b945f68890031e011fec',
          from_account_identifier: address,
          to_account_identifier: address,
          transfer_type: 'send',
          amount: '10000',
          fee: '10000',
          memo: '0',
          created_at: 1674562821
        },
        {
          block_height: '5422942',
          parent_hash: '46cd8002bf6c4778be4b824635d1196557703a111e8628c6ea5b0ebcfc64dece',
          block_hash: '9eb786015376481c135e4da818b21db36809f74ff7c28bc93f03b4a9c00f76d2',
          transaction_hash: '00c50295ee4ac9381d16732d8798a52b339107c576869ed145f97d128a92ee9f',
          from_account_identifier: address,
          to_account_identifier: address,
          transfer_type: 'send',
          amount: '10000',
          fee: '10000',
          memo: '0',
          created_at: 1674562193
        }
      ],
      next: `/accounts/${address}/transactions?limit=2&offset=2`,
      prev: null
    }

    const next = {
      total: 10,
      blocks: [
        {
          block_height: '5422880',
          parent_hash: 'ab9f6a75971c2a9810766926ce4025deae13b0ea49da05b60d58f5c4d3f7f75e',
          block_hash: '6cae98b0de1638218124b241450aafb4dc8abd6029e46c2085a0196563c1a201',
          transaction_hash: '8c3758e5fb8c220377db00086debca67b6eca8bb2765b57e27fcff7e69298563',
          from_account_identifier: address,
          to_account_identifier: address,
          transfer_type: 'send',
          amount: '10000',
          fee: '10000',
          memo: '0',
          created_at: 1674561156
        },
        {
          block_height: '5422868',
          parent_hash: '3fa19e9e3c6a3e6f4d0ae0ba957f301d52e8a824c2ceb8e65e7107ee65436a52',
          block_hash: 'd54fcb891704c871440f44fd63efd581c52f610326cfcfe8e80ee34e4ca47367',
          transaction_hash: 'dcbcb2185a37d51a73e248c75c902842fd23ac33fdfce2f95b6e8859caf556c2',
          from_account_identifier: address,
          to_account_identifier: address,
          transfer_type: 'send',
          amount: '10000',
          fee: '10000',
          memo: '0',
          created_at: 1674560969
        }
      ],
      next: null,
      prev: `/accounts/${address}/transactions?limit=2&offset=0`
    }
    return { first, next }
  }

  // TODO : check the rest below
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
          expectedError: [' not a valid ICP account']
        },
        {
          value: '',
          expectedError: [" can't be blank", ' not a valid ICP account']
        },
        {
          value: 0x0,
          expectedError: [' is not of type "String"', ' not a valid ICP account']
        },
        {
          value: 1,
          expectedError: [' is not of type "String"', ' not a valid ICP account']
        },
        {
          value: -1,
          expectedError: [' is not of type "String"', ' not a valid ICP account']
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

  public validRawTransactions: ICPUnsignedTransaction[] = [
    {
      type: 'unsigned',
      transaction:
        'tx_+FsMAaEB1k9h7FZRnn8Q81kIxA97Moj7Pr3A9sUEqpXseA48f/mhAdZPYexWUZ5/EPNZCMQPezKI+z69wPbFBKqV7HgOPH/5iIrHIwSJ6AAAiA3gtrOnZAAAAACAQCdXaA==',
      networkId: 'ae_mainnet'
    }
  ]

  public validSignedTransactions: ICPSignedTransaction[] = [
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
}
