// tslint:disable:no-console

import { DeserializedSyncProtocol, EthereumProtocol, IAirGapTransaction, SyncProtocolUtils } from '../../src'
import { UnsignedEthereumTransaction } from '../../src/serializer/unsigned-transactions/ethereum-transactions.serializer'

const url: string =
  '3FGmTQe41UxKgNMYnNg8PPnbdrk1JteEoJeF5pX6mfr4Vq69A2ah9ezGojGhd3MgA4ikgQLVxmjosUc8J5Ai8TEjGJZsefA2gSJgLYD76hRmyPXRMHKVVAh7G6TfmXrBs1qSNL3SJuddRaKco4ANM9Up31VH7dko8ys2FdkS4EGcbo4pu33TvAG9dpBMf49fhfQu2m87NxwrucaRykJwTYJABZGY26ciBgcxpJybQxsg5FWXsyLNkZLXN8eXUB5aemA2T7E'

const tezosProtocol: EthereumProtocol = new EthereumProtocol()
const syncProtocol: SyncProtocolUtils = new SyncProtocolUtils()

syncProtocol
  .deserialize(url)
  .then((sync: DeserializedSyncProtocol) => {
    console.log('decoded:', sync)

    // Cast it to the type you expect
    const unsigned: UnsignedEthereumTransaction = sync.payload as UnsignedEthereumTransaction
    tezosProtocol
      .getTransactionDetails({
        publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
        transaction: unsigned.transaction
      })
      .then((result: IAirGapTransaction[]) => {
        console.log('transactions', result)
      })
      .catch((error: Error) => {
        console.error('DESERIALIZE ERROR:', error)
      })
  })
  .catch((error: Error) => {
    console.error('DESERIALIZE ERROR:', error)
  })
