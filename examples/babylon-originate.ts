// tslint:disable:no-console
import BigNumber from 'bignumber.js'

import { TezosProtocol } from '../src'
import { RawTezosTransaction } from '../src/serializer/unsigned-transactions/tezos-transactions.serializer'

const tezosProtocol: TezosProtocol = new TezosProtocol()

const privateKey: string =
  '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
const publicKey: string = 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
// Manager: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
const delegate: string = ''
const amount: BigNumber = new BigNumber(1000000)

tezosProtocol
  .originate(publicKey, delegate, amount)
  .then((result: RawTezosTransaction) => {
    console.log('originate result', result)

    tezosProtocol
      .signWithPrivateKey(Buffer.from(privateKey, 'hex'), result)
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
    console.error('SIGN ERROR: ', error)
  })
