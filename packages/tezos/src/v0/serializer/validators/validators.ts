import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { TezosProtocol } from '../../protocol/TezosProtocol'
import { SignedTezosTransaction } from '../../types/signed-transaction-tezos'

import { RawTezosTransaction } from '../../types/transaction-tezos'
import { UnsignedTezosTransaction } from '../../types/unsigned-transaction-tezos'

validators.isValidTezosUnsignedTransaction = (binaryTx: string) => {
  const rawTx: RawTezosTransaction = { binaryTransaction: binaryTx }
  const unsignedTx: UnsignedTezosTransaction = {
    transaction: rawTx,
    publicKey: '',
    callbackURL: ''
  }

  return new Promise<void>(async (resolve, reject) => {
    if (binaryTx === null || typeof binaryTx === 'undefined') {
      reject('not a valid Tezos transaction')
    }
    const protocol = new TezosProtocol()
    // allow empty values by default (needs to be checked by "presence" check)
    if (binaryTx === null || typeof binaryTx === 'undefined') {
      reject()
    }
    try {
      await protocol.getTransactionDetails(unsignedTx)
      resolve()
    } catch (error) {
      // console.log(error)
      reject('not a valid Tezos transaction')
    }
  })
}

validators.isValidTezosSignedTransaction = (signedTransaction: string) => {
  const signedTx: SignedTezosTransaction = {
    accountIdentifier: '',
    transaction: signedTransaction
  }

  return new Promise<void>(async (resolve, reject) => {
    if (signedTransaction === null || typeof signedTransaction === 'undefined') {
      reject('not a valid Tezos transaction')
    }
    const protocol = new TezosProtocol()
    // allow empty values by default (needs to be checked by "presence" check)
    if (signedTransaction === null || typeof signedTransaction === 'undefined') {
      reject()
    }
    try {
      await protocol.getTransactionDetailsFromSigned(signedTx)
      resolve()
    } catch (error) {
      // console.log(error)
      reject('not a valid Tezos transaction')
    }
  })
}
