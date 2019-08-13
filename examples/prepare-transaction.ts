// tslint:disable:no-any
// tslint:disable:no-console

import BigNumber from '../src/dependencies/src/bignumber.js-9.0.0/bignumber'

import { AeternityProtocol, IAirGapTransaction } from '../src'
import { RawAeternityTransaction } from '../src/serializer/unsigned-transactions/aeternity-transactions.serializer'

const protocol: AeternityProtocol = new AeternityProtocol()

const publicKey: string = '5ab8b757139d4700df37763de6e6e20a2111811a193c235db3792a846a376eeb'
const recipient: string = 'ak_11111111111111111111111111111111273Yts'
const amount: BigNumber = new BigNumber(0)
const fee: BigNumber = new BigNumber(17240000000000)
const data: any = JSON.stringify({
  vote: { id: 1, option: 0 }
})

// Prepare a voting operations for Aeternity (with data)
protocol
  .prepareTransactionFromPublicKey(publicKey, [recipient], [amount], fee, data)
  .then(async (tx: RawAeternityTransaction) => {
    console.log(tx)
    const details: IAirGapTransaction = await protocol.getTransactionDetails({ publicKey: '', transaction: tx })

    console.log(details)
  })
  .catch((error: Error) => {
    console.error('PREPARE_TRANSACTION ERROR:', error)
  })
