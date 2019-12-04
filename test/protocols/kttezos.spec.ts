// import * as chai from 'chai'
// import * as chaiAsPromised from 'chai-as-promised'
// import 'mocha'
// import * as sinon from 'sinon'

// import { isCoinlibReady, TezosKtProtocol } from '../../src'
// import axios from '../../src/dependencies/src/axios-0.19.0/index'
// import {
//   TezosDelegationOperation,
//   TezosOperationType,
//   TezosRevealOperation,
//   TezosSpendOperation
// } from '../../src/protocols/tezos/TezosProtocol'

// import { TezosTestProtocolSpec } from './specs/tezos'

// // use chai-as-promised plugin
// chai.use(chaiAsPromised)
// const expect = chai.expect

// const tezosProtocolSpec = new TezosTestProtocolSpec()
// const ktTezosLib = new TezosKtProtocol()

// describe(`ICoinProtocol KtTezos - Custom Tests`, () => {
//   describe('Kt Transactions', () => {
//     let stub
//     beforeEach(async () => {
//       await isCoinlibReady()
//       sinon.restore()
//       stub = sinon.stub(axios, 'get')

//       // standard stubs for prepareTx
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8/counter`)
//         .returns(Promise.resolve({ data: 917315 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
//         .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8/balance`)
//         .returns(Promise.resolve({ data: 100000000 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8/manager_key`)
//         .returns(Promise.resolve({ data: { key: 'test-key' } }))

//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/counter`)
//         .returns(Promise.resolve({ data: 917315 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
//         .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: 100000000 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/manager_key`)
//         .returns(Promise.resolve({ data: { key: 'test-key' } }))

//       stub.withArgs(`${ktTezosLib.baseApiUrl}/v3/operations/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy?type=Delegation`).returns(
//         Promise.resolve({
//           data: [
//             {
//               hash: 'onuvKtTfAjeEnG3iVSARTtVhLF3PVpsoRsWFpXdCGWsb2ucrZ1L',
//               block_hash: 'BL3JYQiDH111cp6vZdbsjwYJCEuyQ8RtdpqNyPLmUwgV8ZtQC3n',
//               network_hash: 'NetXdQprcVkpaWU',
//               type: {
//                 kind: 'manager',
//                 source: { tz: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy' },
//                 operations: [
//                   {
//                     kind: 'delegation',
//                     src: { tz: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy' },
//                     counter: 9,
//                     fee: 1420,
//                     gas_limit: '10000',
//                     storage_limit: '0',
//                     failed: false,
//                     internal: false,
//                     op_level: 358990,
//                     timestamp: '2019-03-19T12:39:37Z'
//                   }
//                 ]
//               }
//             }
//           ]
//         })
//       )

//       stub.withArgs(`${ktTezosLib.baseApiUrl}/v3/operations/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy?type=Origination`).returns(
//         Promise.resolve({
//           data: [
//             {
//               hash: 'op5UEri2nWbTA9dwu7jGRQuni5MfPUGmgX4Cu2gBx7JAPKKfSUn',
//               block_hash: 'BLP8zGpKjhyGPokB9WXjnessWFjroRNG6xxiFVVjTmd4irUrL1G',
//               network_hash: 'NetXdQprcVkpaWU',
//               type: {
//                 kind: 'manager',
//                 source: {
//                   tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
//                 },
//                 operations: [
//                   {
//                     kind: 'origination',
//                     src: {
//                       tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
//                     },
//                     managerPubkey: {
//                       tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
//                     },
//                     balance: 8352000,
//                     spendable: false,
//                     delegatable: false,
//                     delegate: {
//                       tz: 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ'
//                     },
//                     tz1: {
//                       tz: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy'
//                     },
//                     failed: false,
//                     internal: false,
//                     burn_tez: 257000,
//                     counter: 1215289,
//                     fee: 1400,
//                     gas_limit: '10000',
//                     storage_limit: '257',
//                     op_level: 389762,
//                     timestamp: '2019-03-19T12:39:37Z'
//                   }
//                 ]
//               }
//             }
//           ]
//         })
//       )

//       stub.withArgs(`${ktTezosLib.baseApiUrl}/v3/operations/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L?type=Origination`).returns(
//         Promise.resolve({
//           data: [
//             {
//               hash: 'oortkWqdRGi8wTFBnG5Dk8md9DNt8zFEYTXf8whXYBnqbkU3xK9',
//               block_hash: 'BKsWTFKmzYtZxE514X2st55aujd3VAfQBrj5DsTePGe6vtsZQQV',
//               network_hash: 'NetXdQprcVkpaWU',
//               type: {
//                 kind: 'manager',
//                 source: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                 operations: [
//                   {
//                     kind: 'origination',
//                     src: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                     managerPubkey: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                     balance: 0,
//                     spendable: false,
//                     delegatable: false,
//                     tz1: { tz: 'KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN' },
//                     failed: false,
//                     internal: false,
//                     burn_tez: 257000,
//                     counter: 917320,
//                     fee: 1400,
//                     gas_limit: '10000',
//                     storage_limit: '257',
//                     op_level: 263268,
//                     timestamp: '2019-01-09T16:52:46Z'
//                   }
//                 ]
//               }
//             },
//             {
//               hash: 'ooqg6smMbXwVoVrLgwJjJbHi4gFUB49DZSPiCox7mqmSAuo9CJz',
//               block_hash: 'BMFmVehT2vFpbKNPsYtpzjAFaZeXwm9igiRJp3gaBEywAoAJ67d',
//               network_hash: 'NetXdQprcVkpaWU',
//               type: {
//                 kind: 'manager',
//                 source: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                 operations: [
//                   {
//                     kind: 'origination',
//                     src: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                     managerPubkey: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                     balance: 0,
//                     spendable: false,
//                     delegatable: false,
//                     tz1: { tz: 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy' },
//                     failed: false,
//                     internal: false,
//                     burn_tez: 257000,
//                     counter: 917318,
//                     fee: 1400,
//                     gas_limit: '10000',
//                     storage_limit: '257',
//                     op_level: 263229,
//                     timestamp: '2019-01-09T16:11:16Z'
//                   }
//                 ]
//               }
//             },
//             {
//               hash: 'op1AT5tSAD5PP5c5rSH4B27bQ5uHPqspKetmpCmHbVhSbGqoM5a',
//               block_hash: 'BLF7yz2gZsaXJgmk1XRZc3to1LFueU1vA24RRPAdwGNeR3xxg8G',
//               network_hash: 'NetXdQprcVkpaWU',
//               type: {
//                 kind: 'manager',
//                 source: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                 operations: [
//                   {
//                     kind: 'origination',
//                     src: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                     managerPubkey: { tz: 'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L' },
//                     balance: 0,
//                     spendable: false,
//                     delegatable: false,
//                     tz1: { tz: 'KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8' },
//                     failed: false,
//                     internal: false,
//                     burn_tez: 257000,
//                     counter: 917322,
//                     fee: 1400,
//                     gas_limit: '10000',
//                     storage_limit: '257',
//                     op_level: 264235,
//                     timestamp: '2019-01-10T09:40:47Z'
//                   }
//                 ]
//               }
//             }
//           ]
//         })
//       )

//       // kt specific stubs
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/counter`)
//         .returns(Promise.resolve({ data: 917315 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/counter`)
//         .returns(Promise.resolve({ data: 917315 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/hash`)
//         .returns(Promise.resolve({ data: 'BMJyc7ga9kLV3vH4kbn6GXbBNjRkLEJVSyovoXyY84Er1zMmKKT' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/balance`)
//         .returns(Promise.resolve({ data: 100000000 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: 100000000 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L/manager_key`)
//         .returns(Promise.resolve({ data: { key: 'test-key' } }))
//       stub.withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN`).returns(
//         Promise.resolve({
//           data: {
//             delegate: {
//               setable: true
//             }
//           }
//         })
//       )
//       stub.withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy`).returns(
//         Promise.resolve({
//           data: {
//             delegate: {
//               setable: true,
//               value: 'tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19'
//             }
//           }
//         })
//       )

//       // bakerInfo stubs
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW20/balance`)
//         .returns(Promise.resolve({ data: 3 }))
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW20/delegated_balance`
//         )
//         .returns(Promise.resolve({ data: 5 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW20/staking_balance`)
//         .returns(Promise.resolve({ data: 10 }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW20/deactivated`)
//         .returns(Promise.resolve({ data: false }))

//       // delegationInfo stubs
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/frozen_balance_by_cycle`
//         )
//         .returns(
//           Promise.resolve({
//             data: [
//               { cycle: 79, deposit: '10000', fees: '10', rewards: '100' },
//               { cycle: 80, deposit: '10000', fees: '10', rewards: '100' },
//               { cycle: 81, deposit: '10000', fees: '10', rewards: '100' },
//               { cycle: 82, deposit: '10000', fees: '10', rewards: '100' },
//               { cycle: 83, deposit: '10000', fees: '10', rewards: '100' },
//               { cycle: 84, deposit: '10000', fees: '10', rewards: '100' }
//             ]
//           })
//         )

//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/${84 * 4096}`)
//         .returns(Promise.resolve({ data: { header: { timestamp: '2019-03-08T18:59:14Z' } } }))

//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/299008/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: '1000' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/303104/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: '1000' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/307200/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: '1000' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/311296/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: '1000' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/315392/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: '1000' }))
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/319488/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/balance`)
//         .returns(Promise.resolve({ data: '1000' }))

//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/299008/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/staking_balance`
//         )
//         .returns(Promise.resolve({ data: '50000' }))
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/303104/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/staking_balance`
//         )
//         .returns(Promise.resolve({ data: '50000' }))
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/307200/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/staking_balance`
//         )
//         .returns(Promise.resolve({ data: '50000' }))
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/311296/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/staking_balance`
//         )
//         .returns(Promise.resolve({ data: '50000' }))
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/315392/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/staking_balance`
//         )
//         .returns(Promise.resolve({ data: '50000' }))
//       stub
//         .withArgs(
//           `${ktTezosLib.jsonRPCAPI}/chains/main/blocks/319488/context/delegates/tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19/staking_balance`
//         )
//         .returns(Promise.resolve({ data: '50000' }))
//     })

//     it('should be able to forge and unforge a delegation TX', async () => {
//       /**
//        * Delegate KT1 -> TZ1
//        */
//       const tz = await ktTezosLib.delegate(
//         tezosProtocolSpec.wallet.publicKey,
//         'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy',
//         'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
//       )

//       const tezosWrappedOperation = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
//       const tezosDelegationOperation = tezosWrappedOperation.contents[0] as TezosDelegationOperation

//       expect(tezosDelegationOperation.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
//       expect(tezosDelegationOperation.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')
//       expect(tezosDelegationOperation.fee, 'fee').to.equal('1420')
//       expect(tezosDelegationOperation.counter, 'counter').to.equal('917316')
//       expect(tezosDelegationOperation.gas_limit, 'gas_limit').to.equal('10000')
//       expect(tezosDelegationOperation.storage_limit, 'storage_limit').to.equal('0')
//       expect(tezosDelegationOperation.delegate, 'delegate').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')

//       expect(tz.binaryTransaction).to.equal(
//         'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a01ba4e7349ac25dc5eb2df5a43fceacc58963df4f5008c0bc4fe37904e00ff0091a9d2b003f19cf5a1f38f04f1000ab482d33176'
//       )

//       /**
//        * Delegate TZ1 -> TZ1
//        */
//       const tz2 = await ktTezosLib.delegate(
//         tezosProtocolSpec.wallet.publicKey,
//         'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L',
//         'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
//       )

//       const tezosWrappedOperation2 = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz2.binaryTransaction)
//       const tezosDelegationOperation2 = tezosWrappedOperation2.contents[0] as TezosDelegationOperation

//       expect(tezosDelegationOperation2.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
//       expect(tezosDelegationOperation2.source, 'source').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')
//       expect(tezosDelegationOperation2.fee, 'fee').to.equal('1420')
//       expect(tezosDelegationOperation2.counter, 'counter').to.equal('917316')
//       expect(tezosDelegationOperation2.gas_limit, 'gas_limit').to.equal('10000')
//       expect(tezosDelegationOperation2.storage_limit, 'storage_limit').to.equal('0')
//       expect(tezosDelegationOperation2.delegate, 'delegate').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')

//       expect(tz2.binaryTransaction).to.equal(
//         'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a000091a9d2b003f19cf5a1f38f04f1000ab482d331768c0bc4fe37904e00ff0091a9d2b003f19cf5a1f38f04f1000ab482d33176'
//       )
//     })

//     it('should include a reveal operation when delegating an unrevealed KT address', async () => {
//       stub
//         .withArgs(`${ktTezosLib.jsonRPCAPI}/chains/main/blocks/head/context/contracts/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy/manager_key`)
//         .returns(Promise.resolve({ data: {} }))

//       /**
//        * Delegate KT1 -> TZ1
//        */
//       const tz = await ktTezosLib.delegate(
//         tezosProtocolSpec.wallet.publicKey,
//         'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy',
//         'tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L'
//       )

//       const tezosWrappedOperation = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
//       const tezosRevealOperation = tezosWrappedOperation.contents[0] as TezosRevealOperation
//       const tezosDelegationOperation = tezosWrappedOperation.contents[1] as TezosDelegationOperation

//       expect(tezosWrappedOperation.contents.length, 'operations').to.equal(2) // Make sure reveal and delegate are included

//       expect(tezosRevealOperation.kind, 'kind').to.equal(TezosOperationType.REVEAL)
//       expect(tezosRevealOperation.fee, 'fee').to.equal('1300')
//       expect(tezosRevealOperation.gas_limit, 'gas_limit').to.equal('10000')
//       expect(tezosRevealOperation.storage_limit, 'storage_limit').to.equal('0')
//       expect(tezosRevealOperation.counter, 'counter').to.equal('917316')
//       expect(tezosRevealOperation.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

//       expect(tezosDelegationOperation.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
//       expect(tezosDelegationOperation.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')
//       expect(tezosDelegationOperation.fee, 'fee').to.equal('1420')
//       expect(tezosDelegationOperation.counter, 'counter').to.equal('917317')
//       expect(tezosDelegationOperation.gas_limit, 'gas_limit').to.equal('10000')
//       expect(tezosDelegationOperation.storage_limit, 'storage_limit').to.equal('0')
//       expect(tezosDelegationOperation.delegate, 'delegate').to.equal('tz1YvE7Sfo92ueEPEdZceNWd5MWNeMNSt16L')

//       expect(tz.binaryTransaction).to.equal(
//         'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550701ba4e7349ac25dc5eb2df5a43fceacc58963df4f500940ac4fe37904e0000cdbc0c3449784bd53907c3c7a06060cf12087e492a7b937f044c6a73b522a2340a01ba4e7349ac25dc5eb2df5a43fceacc58963df4f5008c0bc5fe37904e00ff0091a9d2b003f19cf5a1f38f04f1000ab482d33176'
//       )
//     })

//     it('should be able to forge a un-delegation TX', async () => {
//       const tz = await ktTezosLib.undelegate(tezosProtocolSpec.wallet.publicKey, 'KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

//       const tezosWrappedOperation = ktTezosLib.unforgeUnsignedTezosWrappedOperation(tz.binaryTransaction)
//       const tezosDelegationOperation = tezosWrappedOperation.contents[0] as TezosDelegationOperation

//       expect(tezosDelegationOperation.kind, 'kind').to.equal(TezosOperationType.DELEGATION)
//       expect(tezosDelegationOperation.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')
//       expect(tezosDelegationOperation.fee, 'fee').to.equal('1420')
//       expect(tezosDelegationOperation.counter, 'counter').to.equal('917316')
//       expect(tezosDelegationOperation.gas_limit, 'gas_limit').to.equal('10000')
//       expect(tezosDelegationOperation.storage_limit, 'storage_limit').to.equal('0')
//       expect(tezosDelegationOperation.delegate, 'delegate').to.equal(undefined)

//       expect(tz.binaryTransaction).to.equal(
//         'd2794ab875a213d0f89e6fc3cf7df9c7188f888cb7fa435c054b85b1778bb9550a01ba4e7349ac25dc5eb2df5a43fceacc58963df4f5008c0bc4fe37904e0000'
//       )
//     })

//     it('should be able to check the delegation state of a DELEGATED KT address', async () => {
//       const delegatedState = await ktTezosLib.isAddressDelegated('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

//       expect(delegatedState.isDelegated).to.equal(true)
//       expect(delegatedState.setable).to.equal(true)
//       expect(delegatedState.value).to.equal('tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19')

//       expect(delegatedState.delegatedDate!.getTime()).to.equal(new Date('2019-03-19T12:39:37Z').getTime())
//       expect(delegatedState.delegatedOpLevel!).to.equal(358990)
//     })

//     it('should be able to check the delegation state of an UNDELEGATED KT address', async () => {
//       const undelegatedState = await ktTezosLib.isAddressDelegated('KT1RBMUbb7QSD46VXhAvaMiyVSoys6QZiTxN')

//       expect(undelegatedState.isDelegated).to.equal(false)
//       expect(undelegatedState.setable).to.equal(true)
//       expect(undelegatedState.value).to.equal(undefined)
//       expect(undelegatedState.delegatedDate).to.equal(undefined)
//       expect(undelegatedState.delegatedOpLevel).to.equal(undefined)
//     })

//     it('should be able to check the delegation state of a DELEGATED KT address that has been delegated with an ORIGINATION operation', async () => {
//       stub.withArgs(`${ktTezosLib.baseApiUrl}/v3/operations/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy?type=Delegation`).returns(
//         Promise.resolve({
//           data: []
//         })
//       )

//       const delegatedState = await ktTezosLib.isAddressDelegated('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

//       expect(delegatedState.isDelegated).to.equal(true)
//       expect(delegatedState.setable).to.equal(true)
//       expect(delegatedState.value).to.equal('tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19')

//       expect(delegatedState.delegatedDate!.getTime()).to.equal(new Date('2019-03-19T12:39:37Z').getTime())
//       expect(delegatedState.delegatedOpLevel!).to.equal(389762)
//     })

//     it('should be able to check the delegation state but not  of a DELEGATED KT address that has been delegated by an unknown operation and NOT CRASH', async () => {
//       stub.withArgs(`${ktTezosLib.baseApiUrl}/v3/operations/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy?type=Delegation`).returns(
//         Promise.resolve({
//           data: []
//         })
//       )

//       stub.withArgs(`${ktTezosLib.baseApiUrl}/v3/operations/KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy?type=Origination`).returns(
//         Promise.resolve({
//           data: []
//         })
//       )

//       const delegatedState = await ktTezosLib.isAddressDelegated('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

//       expect(delegatedState.isDelegated).to.equal(true)
//       expect(delegatedState.setable).to.equal(true)
//       expect(delegatedState.value).to.equal('tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW19')

//       expect(delegatedState.delegatedDate).to.equal(undefined)
//       expect(delegatedState.delegatedOpLevel).to.equal(undefined)
//     })

//     it('should correctly report the stats of a baker', async () => {
//       const bakerInfo = await ktTezosLib.bakerInfo('tz1cX93Q3KsiTADpCC4f12TBvAmS5tw7CW20')

//       expect(bakerInfo.balance.toFixed()).to.equal('3')
//       expect(bakerInfo.delegatedBalance.toFixed()).to.equal('5')
//       expect(bakerInfo.stakingBalance.toFixed()).to.equal('10')
//       expect(bakerInfo.bakingActive).to.equal(true)
//       expect(bakerInfo.selfBond.toFixed()).to.equal(`${10 - 5}`)
//       expect(bakerInfo.bakerCapacity.toFixed()).to.equal('60.60606060606060606061')
//       expect(bakerInfo.bakerUsage.toFixed()).to.equal('0.165')
//     })

//     it('should correctly report payout/rewards for the last cycles', async () => {
//       const delegationInfo = await ktTezosLib.delegationInfo('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')

//       expect(delegationInfo[0].cycle).to.equal(79)
//       expect(delegationInfo[1].cycle).to.equal(80)
//       expect(delegationInfo[2].cycle).to.equal(81)
//       expect(delegationInfo[3].cycle).to.equal(82)
//       expect(delegationInfo[4].cycle).to.equal(83)
//       expect(delegationInfo[5].cycle).to.equal(84)

//       delegationInfo.forEach(info => {
//         expect(info.totalRewards.toFixed()).to.equal('100')
//         expect(info.totalFees.toFixed()).to.equal('10')
//         expect(info.delegatedBalance.toFixed()).to.equal('1000')
//         expect(info.deposit.toFixed()).to.equal('10000')
//         expect(info.stakingBalance.toFixed()).to.equal('50000')
//         expect(info.reward.toFixed()).to.equal('2.2')
//       })
//     })

//     it('should be able to prepare a standard send', async () => {
//       const preparedTxIndex0 = await ktTezosLib.prepareTransactionFromPublicKey(
//         tezosProtocolSpec.wallet.publicKey,
//         tezosProtocolSpec.txs[0].to,
//         [tezosProtocolSpec.txs[0].amount],
//         tezosProtocolSpec.txs[0].fee,
//         { addressIndex: 0 }
//       )

//       const tezosWrappedOperation0 = ktTezosLib.unforgeUnsignedTezosWrappedOperation(preparedTxIndex0.binaryTransaction)
//       const tezosSpendOperationIndex0 = tezosWrappedOperation0.contents[0] as TezosSpendOperation

//       expect(tezosSpendOperationIndex0.source, 'source').to.equal('KT1HncyWvnY9FcoW8A2KYuauEe5qM1U2ntX8')

//       const preparedTxIndex1 = await ktTezosLib.prepareTransactionFromPublicKey(
//         tezosProtocolSpec.wallet.publicKey,
//         tezosProtocolSpec.txs[0].to,
//         [tezosProtocolSpec.txs[0].amount],
//         tezosProtocolSpec.txs[0].fee,
//         { addressIndex: 1 }
//       )

//       const tezosWrappedOperation1 = ktTezosLib.unforgeUnsignedTezosWrappedOperation(preparedTxIndex1.binaryTransaction)
//       const tezosSpendOperationIndex1 = tezosWrappedOperation1.contents[0] as TezosSpendOperation

//       expect(tezosSpendOperationIndex1.source, 'source').to.equal('KT1RZsEGgjQV5iSdpdY3MHKKHqNPuL9rn6wy')
//     })

//     it('should throw if the address-index is out of bounds', async () => {
//       expect(
//         ktTezosLib.prepareTransactionFromPublicKey(
//           tezosProtocolSpec.wallet.publicKey,
//           tezosProtocolSpec.txs[0].to,
//           [tezosProtocolSpec.txs[0].amount],
//           tezosProtocolSpec.txs[0].fee,
//           { addressIndex: 50 }
//         )
//       ).to.eventually.be.rejectedWith('no kt-address with this index exists')
//     })

//     after(async () => {
//       sinon.restore()
//     })
//   })
// })
