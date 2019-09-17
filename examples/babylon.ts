import BigNumber from 'bignumber.js'
import * as bip39 from 'bip39'

import { IAirGapTransaction, TezosProtocol } from '../src'
import { RawTezosTransaction } from '../src/serializer/unsigned-transactions/tezos-transactions.serializer'

const tezosProtocol: TezosProtocol = new TezosProtocol()

const privateKey: string =
  '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
const publicKey: string = 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
const recipient: string = 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
const amount: BigNumber = new BigNumber(1)
const fee: BigNumber = new BigNumber(1280)

const mnemonic = 'idea right curve cactus absorb very shallow flock scatter cricket cherry supreme snack work abstract'
const newPrivKey = tezosProtocol.getPrivateKeyFromHexSecret(
  bip39.mnemonicToSeedHex(mnemonic, 'nZ8zrTtLfR'),
  tezosProtocol.standardDerivationPath
)
const newPubKey = tezosProtocol.getPublicKeyFromHexSecret(
  bip39.mnemonicToSeedHex(mnemonic, 'nZ8zrTtLfR'),
  tezosProtocol.standardDerivationPath
)
tezosProtocol.getAddressFromPublicKey(newPubKey).then(res => {
  console.log('new address', res)
})

console.log('new pk', newPrivKey)

tezosProtocol
  .prepareTransactionFromPublicKey(publicKey, [recipient], [amount], fee)
  .then(async (tx: RawTezosTransaction) => {
    console.log('tx', tx)
    const details: IAirGapTransaction = await tezosProtocol.getTransactionDetails({ publicKey: '', transaction: tx })

    console.log('details', details)

    tezosProtocol
      .signWithPrivateKey(Buffer.from(privateKey, 'hex'), tx)
      .then(signed => {
        console.log('signed', signed)

        tezosProtocol
          .broadcastTransaction(signed)
          .then(txHash => {
            console.log('broadcasting successful', txHash)
          })
          .catch((error: Error) => {
            console.error('BROADCAST ERROR: ', error)
          })
      })
      .catch((error: Error) => {
        console.error('SIGN ERROR: ', error)
      })
  })
  .catch((error: Error) => {
    console.error('PREPARE ERROR: ', error)
  })
