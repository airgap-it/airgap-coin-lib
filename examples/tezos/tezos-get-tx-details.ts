import { TezosProtocol } from '../../src'

const protocol = new TezosProtocol()

const signed: string = "9609c7a791baf35fb4a5b5ee0e7507c239c388899a943b7a2576bd83eae26b446c00bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abcb817958139bc5000e8070000bf97f5f1dbfd6ada0cf986d0a812f1bf0a572abc00d06b2131c79a53e35cb90433cb26c8a5e2bdd6db1a652187c4718b064bfb71ebad73dcc6d4e3eb3df41124d1b1ceb035b81414f50be1e1d9b77e11b538871b0d"

protocol.getTransactionDetailsFromSigned({ accountIdentifier: '', transaction: signed }).then(details => {
  console.log('Transaction Details: ', details)
}).catch(console.error)

const unsigned: string = "f8f9b125f7ef6bbae5ee27f4612220ac93aa7c392ac5f548d15e18c2bd9a7d926c00075da6a7c0ec09c550623fefd8a9cdf40d3d9910ad8100e1dc5fbc500001000012548f71994cb2ce18072d0dcb568fe35fb7493000"

protocol.getTransactionDetails({ publicKey: '', transaction: { binaryTransaction: unsigned } }).then(details => {
  console.log('Transaction Details: ', details)
}).catch(console.error)
