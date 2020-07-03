// import { TezosFAProtocol } from '../src/protocols/tezos/fa/TezosFAProtocol'
import { TezosBTC } from '../src/protocols/tezos/fa/TezosBTC'
// import { TezosUSD } from '../src/protocols/tezos/fa/TezosUSD'
// import { TezosStaker } from '../src/protocols/tezos/fa/TezosStaker'

// const contract = new TezosBTC('KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn', 'https://tezos-node.prod.gke.papers.tech', 'https://tezos-mainnet-conseil-1.megan.papers.tech')
const contract = new TezosBTC()

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

// const body = '{"predicates":[{"field":"parameters_entrypoints","operation":"eq","set":["transfer"],"inverse":true},{"field":"parameters","operation":"isnull","set":[""],"inverse":true},{"field":"kind","operation":"eq","set":["transaction"],"inverse":false},{"field":"destination","operation":"eq","set":["KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn"],"inverse":false}],"orderBy":[{"field":"block_level","direction":"desc"}],"limit":100}'
// Axios.post('https://tezos-mainnet-conseil-1.megan.papers.tech/v2/data/tezos/mainnet/operations', body, { headers: { 'Content-Type': 'application/json', apiKey: 'airgap123' } }).then(response => {
//     response.data.forEach(async operation => {
//         const normalized = await contract.normalizeTransactionParameters(operation.parameters_micheline ?? operation.parameters, operation.parameters_entrypoints)
//         console.log(normalized.entrypoint, operation.operation_group_hash)
//     })
// })

contract.getTransactionsFromAddresses(["tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT"], 10, 0).then(console.log).catch(console.error)

// contract.getBalance('tz1aqsunnQ9ECPAfvRaWeMfiNFhF3s8M15sy', 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT').then(console.log).catch(console.error)

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
