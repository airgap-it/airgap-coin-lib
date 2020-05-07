// import { TezosFAProtocol } from '../src/protocols/tezos/fa/TezosFAProtocol'
import { TezosBTC } from '../src/protocols/tezos/fa/TezosBTC'
// import { TezosStaker } from '../src/protocols/tezos/fa/TezosStaker'

const contract = new TezosBTC('KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn', 'https://tezos-node.prod.gke.papers.tech', 'https://tezos-mainnet-conseil-1.megan.papers.tech')

// contract
//   .transfer(
//     'tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy',
//     'tz1grSQDByRpnVs7sPtaprNZRp531ZKz6Jmm',
//     '10',
//     '40370',
//     '9430c2ac8fe1403c6cbbee3a98b19f3f3bbdd89d0659b3eb6e4106a5cbe41351'
//   )
//   .then(result => {
//     console.log('RESULT', result)
//   })
//   .catch(error => console.log(error))

// contract.getTransactions(10).then(console.log).catch(console.error)

// contract.fetchTokenHolders().then(console.log).catch(console.error)

// contract.normalizeTransactionParameters('Unparsable code: {"entrypoint":"default","value":{"prim":"Right","args":[{"prim":"Right","args":[{"prim":"Right","args":[{"prim":"Right","args":[{"prim":"Left","args":[{"prim":"Right","args":[{"prim":"Right","args":[{"prim":"Left","args":[{"prim":"Pair","args":[{"bytes":"0000f735ed6df2fb409a8634ce63ac12c82bbb5c83d4"},{"prim":"Pair","args":[{"bytes":"0000a9955122cdcc273d71e0f57db725b74ab177d662"},{"int":"9"}]}]}]}]}]}]}]}]}]}]}}')
// .then((result) => { 
//     console.log(JSON.stringify(result, null, 2))
//     const details = contract.transferDetailsFromParameters(result)
//     console.log(JSON.stringify(details, null, 2)) 
// }).catch(console.error)

contract.getBalance('tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy', 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT').then(console.log).catch(console.error)

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
// contract.getTotalSupply().then(console.log)
// contract.getTotalSupply().then(console.log)
// contract.getTotalMinted('tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT', 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u').then(console.log)
