import { isCoinlibReady } from '../../../src/index'

// prepare, sign and do a TX
const promise = async () => {
  await isCoinlibReady()
  // const tezosKt = new TezosKtProtocol()
}

promise()
  .then(() => {
    'Awaiting...'
  })
  .catch(err => {
    console.warn(err)
  })
