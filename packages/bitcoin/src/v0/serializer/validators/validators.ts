import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { validators } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate'
import { BitcoinProtocol } from '../../protocol/BitcoinProtocol'

validators.isValidBitcoinInput = (ins: unknown) => {
  // if (!Array.isArray(ins)) {
  //   ins = [ins]
  // }
  if (!Array.isArray(ins)) {
    return 'not an array'
  }

  for (let i: number = 0; i < ins.length; i++) {
    const value = ins[i]
    if (!value.hasOwnProperty('txId')) {
      return "doesn't have property txId "
    } else {
      const pattern = RegExp('^[a-fA-F0-9]{64}$')
      if (!pattern.test(value.txId)) {
        return 'not a valid txId'
      }
    }
    if (!value.hasOwnProperty('value')) {
      return "doesn't have property value "
    } else {
      if (!BigNumber.isBigNumber(value.value)) {
        return 'value not a valid BigNumber'
      }
    }
    if (!value.hasOwnProperty('vout')) {
      return "doesn't have property vout"
    } else {
      if (typeof value.vout !== 'number') {
        return 'vout is not a number'
      } else if (value.vout < 0) {
        return 'vout is not a positive value'
      }
    }
    if (!value.hasOwnProperty('address')) {
      return "doesn't have property address "
    } else {
      const pattern = RegExp(new BitcoinProtocol().addressValidationPattern)

      if (!pattern.test(value.address)) {
        return 'not a valid bitcoin address'
      }
    }
    if (!value.hasOwnProperty('derivationPath')) {
      return "doesn't have property derivationPath"
    } else {
      const protocol = new BitcoinProtocol()
      try {
        const mnemonic = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'
        protocol.getPublicKeyFromMnemonic(mnemonic, value.derivationPath)
      } catch (error) {
        return 'invalid derivation path'
      }
    }
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

  for (let i: number = 0; i < outs.length; i++) {
    const value = outs[i]
    if (!value.hasOwnProperty('recipient')) {
      return "doesn't have property recipient"
    } else {
      const pattern = RegExp(new BitcoinProtocol().addressValidationPattern)
      if (!pattern.test(value.recipient)) {
        return 'invalid Bitcoin address'
      }
    }
    if (!value.hasOwnProperty('isChange')) {
      return "doesn't have property isChange "
    } else {
      if (typeof value.isChange !== 'boolean') {
        return 'change is not a boolean'
      }
    }
    if (!value.hasOwnProperty('value')) {
      return "doesn't have property value "
    } else {
      if (!BigNumber.isBigNumber(value.value)) {
        return 'value is not BigNumber'
      }
    }
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
    const bitcoinJSLib = protocol.options.config.bitcoinJSLib
    bitcoinJSLib.Transaction.fromHex(transaction)

    return null
  } catch (error) {
    return 'is not a valid hex encoded Bitcoin transaction'
  }
}
