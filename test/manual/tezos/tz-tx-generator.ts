import { TezosProtocol, SyncProtocolUtils, EncodedType } from '../../../lib/index'
import BigNumber from 'bignumber.js'
import * as sodium from 'libsodium-wrappers'
import * as readline from 'readline'
import * as qrcode from 'qrcode-terminal'
import { SERIALIZER_VERSION } from '../../../lib/serializer/constants'

// prepare, sign and do a TX
const promise = async () => {
  await sodium.ready

  console.log('Preparing Tezos TX...')

  const tezos = new TezosProtocol()

  const privateKey =
    '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
  const publicKey = 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
  const destination = 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'

  const rawTezosTx = await tezos.prepareTransactionFromPublicKey(
    publicKey,
    [destination],
    [new BigNumber('1').shiftedBy(tezos.decimals)],
    new BigNumber('0.001420').shiftedBy(tezos.feeDecimals)
  )

  console.log('Raw TX', rawTezosTx)
  console.log('JSON for Forging', JSON.stringify(rawTezosTx.jsonTransaction))
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
      publicKey: publicKey,
      callback: 'airgap-wallet://?d=',
      transaction: rawTezosTx
    }
  })

  // print QR to Terminal for scanning
  qrcode.generate('airgap-vault://?d=' + syncString, { small: true })

  const answer = (await new Promise((resolve, reject) => {
    rl.question('Would you like to broadcast this TX? [y/N]', resolve)
  })) as string

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
