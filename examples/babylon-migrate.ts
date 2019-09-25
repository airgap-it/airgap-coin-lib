// tslint:disable:no-console

import { IAirGapTransaction, TezosKtProtocol } from '../src'

const tezosProtocol: TezosKtProtocol = new TezosKtProtocol()

// const privateKey: string =
//   '2f243e474992bb96b49b2fa7b2c1cba7a804257f0cf13dceb640cf3210d54838cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
const publicKey: string = 'cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a234'
// Manager: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
const contractToMigrate: string = 'KT1FmL24X3CbCxrSYV12qrNHdXSADXw3wyGz'

tezosProtocol
  .migrate(publicKey, contractToMigrate)
  .then((result: { binaryTransaction: string }) => {
    console.log('delegation result', result)

    tezosProtocol
      .getTransactionDetails({ transaction: result, publicKey })
      .then((txDetails: IAirGapTransaction) => {
        console.log(txDetails)
      })
      .catch((txDetailError: Error) => {
        console.error(txDetailError)
      })

    // tezosProtocol
    //   .signWithPrivateKey(Buffer.from(privateKey, 'hex'), result)
    //   .then((signed: string) => {
    //     console.log('signed', signed)

    //     tezosProtocol
    //       .broadcastTransaction(signed)
    //       .then((txHash: string) => {
    //         console.log('broadcasting successful', txHash)
    //       })
    //       .catch((error: Error) => {
    //         console.error('BROADCAST ERROR: ', error)
    //       })
    //   })
    //   .catch((error: Error) => {
    //     console.error('SIGN ERROR: ', error)
    //   })
  })
  .catch((error: Error) => {
    console.error('SIGN ERROR: ', error)
  })
