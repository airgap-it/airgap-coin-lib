import { EthereumProtocol } from '../..'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as BIP39 from '../../dependencies/src/bip39-2.5.0/index'
import {
  isArray,
  isDate,
  isInteger,
  isNumber,
  isObject,
  isString,
  validate,
  validators
} from '../../dependencies/src/validate.js-0.13.1/validate'
import bs64check from '../../utils/base64Check'
import { UnsignedTezosTransaction } from '../schemas/definitions/transaction-sign-request-tezos'
import { SignedEthereumTransaction } from '../schemas/definitions/transaction-sign-response-ethereum'
import { SignedTezosTransaction } from '../schemas/definitions/transaction-sign-response-tezos'
import { RawTezosTransaction } from '../types'

import { AeternityProtocol } from './../../protocols/aeternity/AeternityProtocol'
import { BitcoinProtocol } from './../../protocols/bitcoin/BitcoinProtocol'
import { TezosProtocol } from './../../protocols/tezos/TezosProtocol'

validators.type = (value, options, key, attributes) => {
  // allow empty values by default (needs to be checked by "presence" check)
  if (value === null || typeof value === 'undefined') {
    return null
  }

  // allow defining object of any type using their constructor. --> options = {clazz: ClassName}
  /*
  if (typeof options === 'object' && options.clazz) {
    return value instanceof options.clazz ? null : 'is not of type "' + options.clazz.name + '"'
  }
  */
  if (!validators.type.checks[options]) {
    throw new Error(`Could not find validator for type ${options}`)
  }

  return validators.type.checks[options](value) ? null : `is not of type "${options}"`
}

validators.type.checks = {
  Object(value: unknown) {
    return isObject(value) && !isArray(value)
  },
  Array: isArray,
  Integer: isInteger,
  Number: isNumber,
  String: isString,
  Date: isDate,
  Boolean(value: unknown) {
    return typeof value === 'boolean'
  },
  BigNumber(value: unknown) {
    return BigNumber.isBigNumber(value)
  }
}

validators.isHexStringWithPrefix = (value: unknown) => {
  if (typeof value !== 'string') {
    return 'is not hex string'
  }
  if (!value.startsWith('0x')) {
    return 'is not hex string'
  }

  const hexWithoutPrefix = value.substr(2)
  if (hexWithoutPrefix.length === 0) {
    // For ethereum, "0x" is valid
    return null
  }

  return /[0-9A-F]/gi.test(hexWithoutPrefix) ? null : 'is not hex string'
}

validators.isPublicKey = (value: unknown) => {
  if (typeof value !== 'string') {
    return 'is not a valid public key: should be of type string'
  }
  if (value.length !== 64) {
    return 'is not a valid public key: wrong length'
  }

  return /[0-9A-F]/gi.test(value) ? null : 'is not a valid public key: invalid characters'
}
// ETHEREUM

validators.isValidEthereumTransactionString = (transaction: string) => {
  // console.log(binaryTransaction)
  return new Promise(async (resolve, reject) => {
    if (transaction === null || typeof transaction === 'undefined') {
      resolve('not a valid Ethereum transaction')
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
      resolve('not a valid Ethereum transaction')
    }
  })
}

// BITCOIN

validators.isValidBitcoinInput = (ins: unknown) => {
  // if (!Array.isArray(ins)) {
  //   ins = [ins]
  // }
  if (!Array.isArray(ins)) {
    return 'not an array'
  }

  for (let i = 0; i < ins.length; i++) {
    const value = ins[i]
    if (!value.hasOwnProperty('txId')) {
      return 'doesn\'t have property txId '
    } else {
      const pattern = RegExp('^[a-fA-F0-9]{64}$')
      if (!pattern.test(value.txId)) {
        return 'not a valid txId'
      }
    }
    if (!value.hasOwnProperty('value')) {
      return 'doesn\'t have property value '
    } else {
      if (!BigNumber.isBigNumber(value.value)) {
        return 'value not a valid BigNumber'
      }
    }
    if (!value.hasOwnProperty('vout')) {
      return 'doesn\'t have property vout'
    } else {
      if (typeof value.vout !== 'number') {
        return 'vout is not a number'
      } else if (value.vout < 0) {
        return 'vout is not a positive value'
      }
    }
    if (!value.hasOwnProperty('address')) {
      return 'doesn\'t have property address '
    } else {
      const pattern = RegExp(new BitcoinProtocol().addressValidationPattern)

      if (!pattern.test(value.address)) {
        return 'not a valid bitcoin address'
      }
    }
    if (!value.hasOwnProperty('derivationPath')) {
      return 'doesn\'t have property derivationPath'
    } else {
      const protocol = new BitcoinProtocol()
      try {
        const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'
        protocol.getPublicKeyFromHexSecret(BIP39.mnemonicToSeedHex(mnemonic), value.derivationPath)
      } catch (error) {
        return 'invalid derivation path'
      }
    }

    return null
  }

  return null
}

validators.isValidBitcoinOutput = (outs: unknown) => {
  // console.log(outs)
  // if (!Array.isArray(outs)) {
  //   outs = [outs]
  // }
  if (!Array.isArray(outs)) {
    return 'not an array'
  }

  for (let i = 0; i < outs.length; i++) {
    const value = outs[i]
    if (!value.hasOwnProperty('recipient')) {
      return 'doesn\'t have property recipient'
    } else {
      const pattern = RegExp(new BitcoinProtocol().addressValidationPattern)
      if (!pattern.test(value.recipient)) {
        return 'invalid Bitcoin address'
      }
    }
    if (!value.hasOwnProperty('isChange')) {
      return 'doesn\'t have property isChange '
    } else {
      if (typeof value.isChange !== 'boolean') {
        return 'change is not a boolean'
      }
    }
    if (!value.hasOwnProperty('value')) {
      return 'doesn\'t have property value '
    } else {
      if (!BigNumber.isBigNumber(value.value)) {
        return 'value is not BigNumber'
      }
    }

    return null
  }

  return null
}

validators.isValidBitcoinFromArray = (array: unknown) => {
  if (!Array.isArray(array)) {
    return 'not an array of Bitcoin addresses'
  }
  for (let i = 0; i < array.length; i++) {
    const address: string = array[i]
    // const testpattern = RegExp(new BitcoinTestnetProtocol().addressValidationPattern) // TODO maybe don't use the testnetprotocol
    const pattern = RegExp(new BitcoinProtocol().addressValidationPattern) // TODO maybe don't use the testnetprotocol

    if (!pattern.test(address)) {
      return 'not a valid bitcoin address'
    }
  }

  return null
}

validators.isBitcoinAccount = (accountIdentifier: string) => {
  if (accountIdentifier === null || typeof accountIdentifier === 'undefined') {
    return null
  }
  try {
    const protocol = new BitcoinProtocol()
    protocol.getAddressFromExtendedPublicKey(accountIdentifier, 0, 0)

    return null
  } catch (error) {
    return 'not a valid Bitcoin account'
  }
}

validators.isValidBitcoinTxString = (transaction: string) => {
  // allow empty values by default (needs to be checked by "presence" check)
  if (transaction === null || typeof transaction === 'undefined') {
    return null
  }
  try {
    const protocol = new BitcoinProtocol()
    const bitcoinJSLib = protocol.bitcoinJSLib
    bitcoinJSLib.Transaction.fromHex(transaction)

    return null
  } catch (error) {
    return 'is not a valid hex encoded Bitcoin transaction'
  }
}

// AETERNITY

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
  return new Promise(async resolve => {
    if (accountIdentifier === null || typeof accountIdentifier === 'undefined') {
      resolve()
    }
    try {
      const protocol = new AeternityProtocol()
      await protocol.getTransactionsFromPublicKey(accountIdentifier, 1, 0)
      resolve()
    } catch (error) {
      resolve('not a valid Aeternity account')
    }
  })
}
// TEZOS

validators.isValidTezosUnsignedTransaction = (binaryTx: string) => {
  const rawTx: RawTezosTransaction = { binaryTransaction: binaryTx }
  const unsignedTx: UnsignedTezosTransaction = {
    transaction: rawTx,
    publicKey: ''
  }

  return new Promise(async (resolve, reject) => {
    if (binaryTx === null || typeof binaryTx === 'undefined') {
      resolve('not a valid Tezos transaction')
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
      resolve('not a valid Tezos transaction')
    }
  })
}

validators.isValidTezosSignedTransaction = (signedTransaction: string) => {
  const signedTx: SignedTezosTransaction = {
    accountIdentifier: '',
    transaction: signedTransaction
  }

  return new Promise(async (resolve, reject) => {
    if (signedTransaction === null || typeof signedTransaction === 'undefined') {
      resolve('not a valid Tezos transaction')
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
      resolve('not a valid Tezos transaction')
    }
  })
}

export async function validateSyncScheme(syncScheme: unknown) {
  const constraints = {
    version: {
      presence: { allowEmpty: false },
      numericality: { noStrings: true, onlyInteger: true, greaterThanOrEqualTo: 0 }
    },
    type: {
      presence: { allowEmpty: false },
      numericality: { noStrings: true, onlyInteger: true, greaterThanOrEqualTo: 0 }
    },
    protocol: {
      presence: { allowEmpty: false },
      type: 'String',
      length: {
        minimum: 1
      }
    },
    payload: {
      presence: { allowEmpty: false },
      type: 'Array'
    }
  }

  return validate(syncScheme, constraints)
}

// tslint:disable-next-line
/*
function validateSerializationInput(from: string, fee: BigNumber, amount: BigNumber, publicKey: string, transaction: any) {
  const constraints = {
    from: {
      presence: { allowEmpty: false },
      type: 'String'
    },
    fee: {
      presence: { allowEmpty: false },
      type: 'BigNumber'
    },
    amount: {
      presence: { allowEmpty: false },
      type: 'BigNumber'
    },
    publicKey: {
      presence: { allowEmpty: false },
      type: 'String'
    },
    transaction: {
      presence: { allowEmpty: false },
      type: 'Array'
    }
  }

  let test = validate(
    {
      from,
      fee,
      amount,
      publicKey,
      transaction
    },
    constraints
  )

  return test
}
*/
