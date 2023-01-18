import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import bs64check from '@airgap/coinlib-core/utils/base64Check'

import { AeternityProtocol } from '../../protocol/AeternityProtocol'

validators.isMainNet = (value: unknown) => {
  // allow empty values by default (needs to be checked by "presence" check)
  if (value === null || typeof value === 'undefined') {
    return null
  }
  if (value !== 'ae_mainnet') {
    return 'is not on mainnet'
  }

  return null
}

validators.isValidAeternityTx = (transaction: unknown) => {
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
}

validators.isValidAeternityAccount = (accountIdentifier: string) => {
  return new Promise<void>(async (resolve, reject) => {
    if (accountIdentifier === null || typeof accountIdentifier === 'undefined') {
      reject()
    }
    try {
      const protocol = new AeternityProtocol()
      await protocol.getTransactionsFromPublicKey(accountIdentifier, 1)
      resolve()
    } catch (error) {
      reject('not a valid Aeternity account')
    }
  })
}
