import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'

import { EthereumProtocol } from '../../protocol/EthereumProtocol'
import { SignedEthereumTransaction } from '../../types/signed-transaction-ethereum'

validators.isValidEthereumTransactionString = (transaction: string) => {
  // console.log(binaryTransaction)
  return new Promise<void>(async (resolve, reject) => {
    if (transaction === null || typeof transaction === 'undefined') {
      reject('not a valid Ethereum transaction')
    }
    const signedTx: SignedEthereumTransaction = {
      accountIdentifier: '',
      transaction
    }
    const protocol = new EthereumProtocol()
    // allow empty values by default (needs to be checked by "presence" check)
    if (transaction === null || typeof transaction === 'undefined') {
      reject()
    }
    try {
      await protocol.getTransactionDetailsFromSigned(signedTx)
      resolve()
    } catch (error) {
      // console.log(error)
      reject('not a valid Ethereum transaction')
    }
  })
}
