import bs64check from '@airgap/coinlib-core/utils/base64Check'
import { newPublicKey } from '@airgap/module-kit'

import { createICPProtocol } from '../../../protocol/ICPProtocol'

export const icpValidators = {
  isMainNet: (value: unknown) => {
    // allow empty values by default (needs to be checked by "presence" check)
    if (value === null || typeof value === 'undefined') {
      return null
    }
    if (value !== 'ae_mainnet') {
      return 'is not on mainnet'
    }

    return null
  },

  isValidICPTx: (transaction: unknown) => {
    // allow empty values by default (needs to be checked by "presence" check)
    if (transaction === null || typeof transaction === 'undefined') {
      return null
    }

    if (typeof transaction === 'string' && !transaction.startsWith('tx_')) {
      return 'invalid tx format'
    } else if (typeof transaction === 'string') {
      try {
        bs64check.decode(transaction.replace('tx_', ''))

        return null
      } catch (error) {
        return "isn't base64 encoded"
      }
    } else {
      return "isn't a string"
    }
  },

  isValidICPAccount: (accountIdentifier: string) => {
    return new Promise<void>(async (resolve, reject) => {
      if (accountIdentifier === null || typeof accountIdentifier === 'undefined') {
        reject()
      }
      try {
        const protocol = createICPProtocol()
        await protocol.getTransactionsForPublicKey(newPublicKey(accountIdentifier, 'hex'), 1)
        resolve()
      } catch (error) {
        reject('not a valid ICP account')
      }
    })
  }
}
