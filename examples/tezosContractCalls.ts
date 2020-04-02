// import { TezosFAProtocol } from '../src/protocols/tezos/fa/TezosFAProtocol'
import { TezosBTC } from '../src/protocols/tezos/fa/TezosBTC'
// import { UnsignedTezosTransaction } from '../src/serializer/v1/unsigned-transactions/tezos-transactions.serializer'
// import { SyncProtocolUtils, EncodedType } from '../src/serializer/v1/serializer'
// import { SERIALIZER_VERSION } from '../src/serializer/v1/constants'

// const protocol = new TezosBTC()
// const pubKey = '9430c2ac8fe1403c6cbbee3a98b19f3f3bbdd89d0659b3eb6e4106a5cbe41351'
// const fromAddress = 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'
// const toAddress = 'tz1UmM6TUo9PJ2VixcVzGwAJpobhCx1yYpmV'
// const amount = '0'
// const fee = '1600000'

// const syncProtocolUtils = new SyncProtocolUtils()
const contract = new TezosBTC()
// const contract = new TezosFAProtocol({
//     symbol: 'TZBTC',
//     name: 'Tezos BTC',
//     marketSymbol: 'btc',
//     identifier: 'xtz-btc',
//     feeDefaults: {
//       low: '0.250',
//       medium: '0.50',
//       high: '1.00'
//     },
//     contractAddress: 'KT1EctCuorV2NfVb1XTQgvzJ88MQtWP8cMMv',//'KT1LH2o12xVRwTpJMZ6QJG74Fox8gE9QieFd',
//     jsonRPCAPI: 'https://tezos-mainnet-node-1.kubernetes.papers.tech'
//   })
// contract.getBalance('tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy').then(result => {
//     console.log('BALANCE', result)
// }).catch(error => console.log(error))

// edpktpPTi9MLK2wabnNny1kD5LvBmGtFdRjnCiUT3ZZgNDjjM4mpoh
// tz1grSQDByRpnVs7sPtaprNZRp531ZKz6Jmm

contract
  .transfer(
    'tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy',
    'tz1grSQDByRpnVs7sPtaprNZRp531ZKz6Jmm',
    '10',
    '40370',
    '9430c2ac8fe1403c6cbbee3a98b19f3f3bbdd89d0659b3eb6e4106a5cbe41351'
  )
  .then(result => {
    console.log('RESULT', result)
  })
  .catch(error => console.log(error))

// contract.getAllowance('tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy', 'tz1grSQDByRpnVs7sPtaprNZRp531ZKz6Jmm').then(result => {
//     console.log('ALLOWANCE', result)
// }).catch(error => console.log(error))

// contract.approve('tz1grSQDByRpnVs7sPtaprNZRp531ZKz6Jmm', '10', '40370', 'edpktpPTi9MLK2wabnNny1kD5LvBmGtFdRjnCiUT3ZZgNDjjM4mpoh').then(result => {
//     console.log('RESULT', result)
// }).catch(error => console.log(error))

// contract.getTransactionsFromAddresses(['tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT'], 10, 0).then(result => {
//     console.log('RESULT', result)
// }).catch(error => console.log(error))

// contract.getTransactions(3).then(result => {
//     console.log(result.transactions)
//     contract.getTransactions(3, result.cursor).then(result => {
//         console.log(result.transactions)
//     })
// })

// contract.getTotalBurned('tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy', 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u').then(console.log)
contract.getTotalSupply().then(console.log)
// contract.getTotalSupply().then(console.log)
// contract.getTotalMinted('tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT', 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u').then(console.log)

// contract.transfer(fromAddress, toAddress, amount, fee, pubKey)
//     .then(rawTx => {
//         syncProtocolUtils
//             .serialize({
//                 version: SERIALIZER_VERSION,
//                 protocol: 'xtz-btc',
//                 type: EncodedType.UNSIGNED_TRANSACTION,
//                 payload: {
//                     publicKey: pubKey,
//                     callback: 'airgap-wallet://?d=',
//                     transaction: rawTx
//                 }
//             })
//             .then(async serialized => {
//                 syncProtocolUtils.deserialize(serialized).then(async deserialized => {
//                     const unsignedTx = deserialized.payload as UnsignedTezosTransaction
//                     const airGapTxs = await protocol.getTransactionDetails(unsignedTx).catch(err => console.error(err))
//                     console.log(airGapTxs)
//                 })
//             })
//     })
//     .catch(error => console.log(error))
