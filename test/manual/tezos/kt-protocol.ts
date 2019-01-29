import { isCoinlibReady, TezosKtProtocol } from '../../../lib/index'

// prepare, sign and do a TX
const promise = async () => {
  await isCoinlibReady()
  const tezosKt = new TezosKtProtocol({ address: 'KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8' })
}

promise()
  .then(() => {
    'Awaiting...'
  })
  .catch(err => {
    console.warn(err)
  })
