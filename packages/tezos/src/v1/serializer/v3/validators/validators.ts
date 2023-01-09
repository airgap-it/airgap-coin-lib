import { newPublicKey, newSignedTransaction, newUnsignedTransaction } from '@airgap/module-kit'

import { createTezosProtocol } from '../../../protocol/TezosProtocol'
import { TezosSignedTransaction, TezosUnsignedTransaction } from '../../../types/transaction'

export const tezosValidators = {
  isValidTezosUnsignedTransaction: (binaryTx: string) => {
    return new Promise<void>(async (resolve, reject) => {
      if (binaryTx === null || typeof binaryTx === 'undefined') {
        reject('not a valid Tezos transaction')
      }
      const protocol = createTezosProtocol()
      // allow empty values by default (needs to be checked by "presence" check)
      if (binaryTx === null || typeof binaryTx === 'undefined') {
        reject()
      }
      try {
        await protocol.getDetailsFromTransaction(
          newUnsignedTransaction<TezosUnsignedTransaction>({ binary: binaryTx }),
          newPublicKey('00', 'hex')
        )
        resolve()
      } catch (error) {
        // console.log(error)
        reject('not a valid Tezos transaction')
      }
    })
  },

  isValidTezosSignedTransaction: (signedTransaction: string) => {
    return new Promise<void>(async (resolve, reject) => {
      if (signedTransaction === null || typeof signedTransaction === 'undefined') {
        reject('not a valid Tezos transaction')
      }
      const protocol = createTezosProtocol()
      // allow empty values by default (needs to be checked by "presence" check)
      if (signedTransaction === null || typeof signedTransaction === 'undefined') {
        reject()
      }
      try {
        await protocol.getDetailsFromTransaction(
          newSignedTransaction<TezosSignedTransaction>({ binary: signedTransaction }),
          newPublicKey('00', 'hex')
        )
        resolve()
      } catch (error) {
        // console.log(error)
        reject('not a valid Tezos transaction')
      }
    })
  }
}
