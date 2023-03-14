// tslint:disable: no-object-literal-type-assertion
import { Amount, PublicKey, SecretKey } from '@airgap/module-kit'

import {
  CkBTCOfflineProtocol,
  CkBTCOnlineProtocol,
  createCkBTCOfflineProtocol,
  createCkBTCOnlineProtocol,
  ICPSignedTransaction,
  ICPUnits,
  ICPUnsignedTransaction
} from '../../src/v1'
import { TestProtocolSpec } from '../implementations'
import { CkBTCProtocolStub } from '../stubs/ckbtc.stub'

// mnemonic                :  october prison mutual save clap curtain fit dream limit guard absurd hill travel develop mix hire wet awesome avocado voyage excess seat battle dish
// public key              :  3056301006072a8648ce3d020106052b8104000a034200041bdf9a8840883856e977bb0411cdf24bc2214f4acb457c597b11e0ee8990acee9dd89412abc2d8566ef2d71dacbe95b449907edf8989d7002c779a97aebf0ca1
// private key             :  24a69f5168a28adfbd2a612289095a935dd2b34c6a7661e5667c6663945debf5
// address                 :  78a47d34778a0bb211f649b54379e6be6286ddd6f459826352ee2819564343de

export class CkBTCTestProtocolSpec extends TestProtocolSpec<CkBTCOfflineProtocol, CkBTCOnlineProtocol> {
  public name = 'ckBTC'
  public offlineLib = createCkBTCOfflineProtocol()
  public onlineLib = createCkBTCOnlineProtocol()
  public stub = new CkBTCProtocolStub()

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
    addresses: ['4eyoo-sp7ea-plipl-i753w-5ioup-kchcz-2vdk3-ancwd-kirhg-kg63c-zae']
  }

  public validAddresses = [
    'ygbxo-p3yib-tmksa-hy6vb-mzna6-5twjn-4poz6-ptbwb-bzqzs-dw722-2ae',
    'lnmkv-jbiza-x3vxj-xsjfd-c6lei-3wler-fvh4z-ah3nt-tuu6j-73dnw-aae',
    '6ygtx-aabwu-y2t6c-qpelu-3lovh-ptcf6-lb56p-bnaiy-ldv5q-dmror-zqe',
    'py54b-aqaaa-aaaar-aagzq-cai',
    'btnej-myaaa-aaaaf-bfiba-cai',
    'kll36-2bqcw-atoy7-agg4k-55g5h-khlfi-jtu3t-psg2s-s3egl-wfwed-5qe'
    // TODO: add more addresses but with subaccounts
  ]

  public txs = [
    {
      to: ['kizxo-wsi62-htpjz-6dssa-5lhqs-rendx-tjfgc-7b6es-r2zbw-tlzb5-eae'],
      from: ['4eyoo-sp7ea-plipl-i753w-5ioup-kchcz-2vdk3-ancwd-kirhg-kg63c-zae'],
      amount: { value: '10000', unit: 'blockchain' } as Amount<ICPUnits>,
      fee: { value: '10', unit: 'blockchain' } as Amount<ICPUnits>,
      unsignedTx: {
        type: 'unsigned',
        transaction:
          '4449444c066d7b6e006c02b3b0dac30368ad86ca8305016e7d6e786c06fbca0102c6fcb60203ba89e5c20401a2de94eb060182f3f3910c04d8a38ca80d7d0105011d48f68f37a73e1ca40eacf09448d1de692985f0f8928eb21b4d790f480200010a000000904e',
        networkId: ''
      } as ICPUnsignedTransaction,
      signedTx: {
        type: 'signed',
        transaction:
          'd9d9f7a367636f6e74656e74a66361726758674449444c066d7b6e006c02b3b0dac30368ad86ca8305016e7d6e786c06fbca0102c6fcb60203ba89e5c20401a2de94eb060182f3f3910c04d8a38ca80d7d0105011d48f68f37a73e1ca40eacf09448d1de692985f0f8928eb21b4d790f480200010a000000904e6b63616e69737465725f69644a000000000230000601016e696e67726573735f6578706972791b1749d75ba943a9806b6d6574686f645f6e616d656e69637263315f7472616e736665726c726571756573745f747970656463616c6c6673656e646572581dff201eb43d68ff776ea1d47a847167551ab6068ac352227328ded8b2026d73656e6465725f7075626b657958583056301006072a8648ce3d020106052b8104000a034200041bdf9a8840883856e977bb0411cdf24bc2214f4acb457c597b11e0ee8990acee9dd89412abc2d8566ef2d71dacbe95b449907edf8989d7002c779a97aebf0ca16a73656e6465725f7369675840719bbb92e45ad32208b2be16f83df6e98a0936181106495380ada1944c964d0471d5024a832db8be9d2bd395ebd17ef340fe65b61613fe51db763a23ff83d881'
      } as ICPSignedTransaction
    }
  ]

  public transactionList(address: string): any {
    // TODO: fix paging tests and return a mock list here
    return {}
  }

  public validRawTransactions: ICPUnsignedTransaction[] = []
  public validSignedTransactions: ICPSignedTransaction[] = []
}
