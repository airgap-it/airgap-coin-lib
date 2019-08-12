import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import * as qrcode from 'qrcode-terminal'
import * as readline from 'readline'

import { EncodedType, isCoinlibReady, SyncProtocolUtils, TezosKtProtocol } from '../../../src/index'
import { SERIALIZER_VERSION } from '../../../src/serializer/constants'

// prepare, sign and do a TX
const promise = async () => {
  await isCoinlibReady()

  console.log('Preparing Tezos TX...')

  const tezos = new TezosKtProtocol()

  const privateKey =
    '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
  const publicKey = 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
  const destination = process.argv[2] || 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
  const amount = new BigNumber(process.argv[3]) || new BigNumber('1')
  const fee = new BigNumber(process.argv[4]) || new BigNumber('0.001420')

  const rawTezosTx = await tezos.prepareTransactionFromPublicKey(
    publicKey,
    [destination],
    [amount.shiftedBy(tezos.decimals)],
    fee.shiftedBy(tezos.feeDecimals)
  )

  console.log('Raw TX', rawTezosTx)
  console.log('JSON for Forging', JSON.stringify(rawTezosTx))
  console.log('Signing Tezos TX...')

  const signedTx = await tezos.signWithPrivateKey(Buffer.from(privateKey, 'hex'), rawTezosTx)

  console.log('Signed TX', signedTx)

  const rl = await readline.createInterface({ input: process.stdin, output: process.stdout })

  const syncProtocolUtils = new SyncProtocolUtils()

  const syncString = await syncProtocolUtils.serialize({
    version: SERIALIZER_VERSION,
    protocol: tezos.identifier,
    type: EncodedType.UNSIGNED_TRANSACTION,
    payload: {
      publicKey,
      callback: 'airgap-wallet://?d=',
      transaction: rawTezosTx
    }
  })

  // print QR to Terminal for scanning
  qrcode.generate('airgap-vault://?d=' + syncString, { small: true })

  const answer = await new Promise((resolve, reject) => {
    rl.question('Would you like to broadcast this TX? [y/N]', resolve)
  })

  if (answer.toLowerCase() === 'y') {
    console.log('Broadcasting TX...')
    const txHash = await tezos.broadcastTransaction(signedTx)
    console.log('Broadcasted TX:', txHash)
    return
  }

  console.log('Did not broadcast TX')
}

promise()
  .then(() => {
    'Awaiting...'
  })
  .catch(err => {
    console.warn(err)
  })
