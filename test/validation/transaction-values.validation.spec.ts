// import { expect } from 'chai'
// import 'mocha'

// import { deepCopy } from '../helpers/deep-copy'
// import { AETestProtocolSpec } from '../protocols/specs/ae'
// import { BitcoinProtocolSpec } from '../protocols/specs/bitcoin'
// import { EthereumTestProtocolSpec } from '../protocols/specs/ethereum'
// import { TezosTestProtocolSpec } from '../protocols/specs/tezos'

// const protocols = [new BitcoinProtocolSpec(), new AETestProtocolSpec(), new EthereumTestProtocolSpec(), new TezosTestProtocolSpec()]

// protocols.forEach(async protocol => {
//   describe(`Validation for ${protocol.name}`, () => {
//     it(`should display correct error message for each faulty unsigned tx`, async () => {
//       protocol.invalidUnsignedTransactionValues.forEach(value => {
//         // const rawTxString = JSON.stringify(protocol.validTransactionValues[0])
//         const rawTx = deepCopy(protocol.validRawTransactions[0]) // JSON.parse(rawTxString)

//         value.values.forEach(async v => {
//           rawTx[value.property] = v.value

//           const unsignedTx = { transaction: rawTx, publicKey: '' }
//           try {
//             const errors = await protocol.validator.validateUnsignedTransaction(unsignedTx)
//             if (v.expectedError) {
//               const expectedErrors = {}

//               expectedErrors[value.property] = v.expectedError.map(e => `${value.testName}${e}`)

//               expect(errors).to.deep.equal(expectedErrors)
//             } else {
//               expect(errors).to.be.undefined
//             }
//           } catch (error) {
//             console.log('error', error)
//           }
//         })
//       })
//     })

//     it(`should display no errors for each valid signed tx`, async () => {
//       protocol.validSignedTransactions.forEach(async transaction => {
//         const signedTx = deepCopy(transaction)
//         const errors = await protocol.validator.validateSignedTransaction(signedTx)
//         expect(errors).to.be.undefined
//       })
//     })

//     it(`should display correct error message for each faulty signed value`, async () => {
//       protocol.invalidSignedTransactionValues.forEach(value => {
//         const rawTx = deepCopy(protocol.validSignedTransactions[0]) // JSON.parse(rawTxString)

//         value.values.forEach(async v => {
//           rawTx[value.property] = v.value

//           try {
//             const errors = await protocol.validator.validateSignedTransaction(rawTx)
//             if (v.expectedError) {
//               const expectedErrors = {}

//               expectedErrors[value.property] = v.expectedError.map(e => `${value.testName}${e}`)

//               expect(errors).to.deep.equal(expectedErrors)
//             } else {
//               expect(errors).to.be.undefined
//             }
//           } catch (error) {
//             console.log('error', error)
//           }
//         })
//       })
//     })
//   })
// })
