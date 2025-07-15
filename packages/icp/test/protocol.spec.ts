// tslint:disable no-floating-promises
// import { AirGapTransaction } from '@airgap/module-kit'
import { AirGapTransaction /*, isAmount*/ } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { CkBTCTestProtocolSpec } from './specs/ckbtc'
import { ICPTestProtocolSpec } from './specs/icp'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols: TestProtocolSpec[] = [new ICPTestProtocolSpec(), new CkBTCTestProtocolSpec()]

// const itIf = (condition, title, test) => {
//   return condition ? it(title, test) : it.skip(title, test)
// }

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    const protocolMetadata = await protocol.offlineLib.getMetadata()

    describe(`Protocol ${protocol.name}`, () => {
      describe(`KeyPair`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('getKeyPairFromDerivative - should be able to create a key pair from a derivative (extended keys)', async () => {
          const { secretKey, publicKey } = await protocol.offlineLib.getKeyPairFromDerivative(await protocol.derivative())

          expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
          expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
        })

        it('getAddressFromPublicKey - should be able to create a valid address from a supplied publicKey', async () => {
          const { publicKey } = await protocol.offlineLib.getKeyPairFromDerivative(await protocol.derivative())

          const address = await protocol.onlineLib
            .getAddressFromPublicKey(publicKey)
            .then((value) => (typeof value === 'string' ? value : value.address))

          // check if address format matches
          if (protocolMetadata.account?.address?.regex) {
            expect(address.match(new RegExp(protocolMetadata.account.address.regex))).not.to.equal(null)
          }

          // check if address matches to supplied one
          expect(address).to.equal(protocol.wallet.addresses[0], 'address does not match')
        })
      })

      describe(`Prepare Transaction`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('prepareTransactionWithPublicKey - Is able to prepare a tx using its public key', async () => {
          const preparedTx = await protocol.onlineLib.prepareTransactionWithPublicKey(
            protocol.wallet.publicKey,
            [
              {
                to: protocol.txs[0].to[0],
                amount: protocol.txs[0].amount
              }
            ],
            { fee: protocol.txs[0].fee }
          )

          protocol.txs.forEach((tx) => {
            if (tx.properties) {
              tx.properties.forEach((property) => {
                expect(preparedTx).to.have.property(property)
              })
            }
            expect(preparedTx).to.deep.include(tx.unsignedTx)
          })
        })

        it('prepareTransactionWithPublicKey - Is able to prepare a transaction with amount 0', async () => {
          // should not throw an exception when trying to create a 0 TX, given enough funds are available for the gas
          try {
            await protocol.onlineLib.prepareTransactionWithPublicKey(
              protocol.wallet.publicKey,
              [
                {
                  to: protocol.txs[0].to[0],
                  amount: { value: '0', unit: 'blockchain' }
                }
              ],
              { fee: protocol.txs[0].fee }
            )
          } catch (error) {
            throw error
          }

          // TODO
          // // restore stubs
          // sinon.restore()
          // await protocol.stub.noBalanceStub(protocol)

          // try {
          //   await protocol.lib.prepareTransactionWithPublicKey(
          //     protocol.wallet.publicKey,
          //     [
          //       {
          //         to: protocol.txs[0].to[0],
          //         amount: { value: '0', unit: 'blockchain' }
          //       }
          //     ],
          //     { fee: protocol.txs[0].fee }
          //   )
          //   throw new Error(`should have failed`)
          // } catch (error) {
          //   expect(error.toString()).to.contain('balance')
          // }
        })
      })

      describe(`Sign Transaction`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('signTransactionWithSecretKey - Is able to sign a transaction using a SecretKey', async () => {
          const { secretKey } = await protocol.offlineLib.getKeyPairFromDerivative(await protocol.derivative())

          const txs: any[] = []

          for (const { unsignedTx } of protocol.txs) {
            const tx = await protocol.offlineLib.signTransactionWithSecretKey(unsignedTx, secretKey)
            txs.push(tx)
          }

          // TODO : check it is possible to get a fixed signed transaction hex
          // https://en.wikipedia.org/wiki/K-independent_hashing

          // for (let index = 0; index < txs.length; index++) {
          //   expect(txs[index]).to.deep.equal(protocol.txs[index].signedTx)
          // }
        })
      })

      describe(`Extract TX`, () => {
        it('getDetailsFromTransaction - Is able to extract all necessary properties from an unsigned TX', async () => {
          for (const tx of protocol.txs) {
            const offlineAirgapTxs: AirGapTransaction[] = await protocol.offlineLib.getDetailsFromTransaction(
              tx.unsignedTx,
              protocol.wallet.publicKey
            )
            const onlineAirgapTxs: AirGapTransaction[] = await protocol.onlineLib.getDetailsFromTransaction(
              tx.unsignedTx,
              protocol.wallet.publicKey
            )

            if (offlineAirgapTxs.length !== 1 || onlineAirgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }

            const offlineAirgapTx: AirGapTransaction = JSON.parse(JSON.stringify(offlineAirgapTxs[0]))
            const onlineAirgapTx: AirGapTransaction = JSON.parse(JSON.stringify(onlineAirgapTxs[0]))

            expect(offlineAirgapTx.to, 'to property does not match').to.deep.equal(tx.to)
            expect(onlineAirgapTx.to, 'to property does not match').to.deep.equal(tx.to)

            expect(offlineAirgapTx.from, 'from property does not match').to.deep.equal(tx.from)
            expect(onlineAirgapTx.from, 'from property does not match').to.deep.equal(tx.from)

            expect(offlineAirgapTx.amount, 'amount does not match').to.deep.equal(protocol.txs[0].amount)
            expect(onlineAirgapTx.amount, 'amount does not match').to.deep.equal(protocol.txs[0].amount)

            expect(offlineAirgapTx.fee, 'fee does not match').to.deep.equal(protocol.txs[0].fee)
            expect(onlineAirgapTx.fee, 'fee does not match').to.deep.equal(protocol.txs[0].fee)
          }
        })

        it('getDetailsFromTransaction - Is able to extract all necessary properties from a signed TX', async () => {
          for (const tx of protocol.txs) {
            const offlineAirgapTxs: AirGapTransaction[] = await protocol.offlineLib.getDetailsFromTransaction(
              tx.signedTx,
              protocol.wallet.publicKey
            )
            const onlineAirgapTxs: AirGapTransaction[] = await protocol.offlineLib.getDetailsFromTransaction(
              tx.signedTx,
              protocol.wallet.publicKey
            )

            if (offlineAirgapTxs.length !== 1 || onlineAirgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }

            const offlineAirgapTx: AirGapTransaction = JSON.parse(JSON.stringify(offlineAirgapTxs[0]))
            const onlineAirgapTx: AirGapTransaction = JSON.parse(JSON.stringify(onlineAirgapTxs[0]))

            expect(
              offlineAirgapTx.to.map((obj) => obj.toLowerCase()),
              'from'
            ).to.deep.equal(tx.to.map((obj) => obj.toLowerCase()))
            expect(
              onlineAirgapTx.to.map((obj) => obj.toLowerCase()),
              'from'
            ).to.deep.equal(tx.to.map((obj) => obj.toLowerCase()))

            expect(
              offlineAirgapTx.from.sort().map((obj) => obj.toLowerCase()),
              'to'
            ).to.deep.equal(tx.from.sort().map((obj) => obj.toLowerCase()))
            expect(
              onlineAirgapTx.from.sort().map((obj) => obj.toLowerCase()),
              'to'
            ).to.deep.equal(tx.from.sort().map((obj) => obj.toLowerCase()))

            expect(offlineAirgapTx.amount).to.deep.equal(protocol.txs[0].amount)
            expect(onlineAirgapTx.amount).to.deep.equal(protocol.txs[0].amount)

            expect(offlineAirgapTx.fee).to.deep.equal(protocol.txs[0].fee)
            expect(onlineAirgapTx.fee).to.deep.equal(protocol.txs[0].fee)
          }
        })

        it('should match all valid addresses', async () => {
          for (const address of protocol.validAddresses) {
            const match = protocolMetadata.account?.address?.regex ? address.match(protocolMetadata.account.address.regex) : false

            expect(match && match.length > 0, `address: ${address}`).to.be.true
          }
        })
      })

      // TODO : Sign message
      // describe(`Sign Message`, async () => {
      //   afterEach(async () => {
      //     sinon.restore()
      //   })

      //   itIf(protocol.messages.length > 0, 'signMessageWithKeyPair - Is able to sign a message using a key pair', async () => {
      //     const { secretKey, publicKey } = await protocol.lib.getKeyPairFromSecret(
      //       { type: 'mnemonic', value: protocol.mnemonic() },
      //       protocolMetadata.account?.standardDerivationPath
      //     )

      //     for (const messageObject of protocol.messages) {
      //       try {
      //         const signature = await protocol.lib.signMessageWithKeyPair(messageObject.message, {
      //           publicKey,
      //           secretKey
      //         })
      //         expect(signature).to.deep.equal(messageObject.signature)
      //       } catch (e) {
      //         expect(e.message).to.equal('Method not implemented.')
      //       }
      //     }
      //   })

      //   itIf(protocol.messages.length > 0, 'verifyMessageWithPublicKey - Is able to verify a message using a PublicKey', async () => {
      //     const { publicKey } = await protocol.lib.getKeyPairFromSecret(
      //       { type: 'mnemonic', value: protocol.mnemonic() },
      //       protocolMetadata.account?.standardDerivationPath
      //     )

      //     for (const messageObject of protocol.messages) {
      //       try {
      //         const signatureIsValid = await protocol.lib.verifyMessageWithPublicKey(
      //           messageObject.message,
      //           messageObject.signature,
      //           publicKey
      //         )

      //         expect(signatureIsValid).to.be.true
      //       } catch (e) {
      //         expect(e.message).to.equal('Method not implemented.')
      //       }
      //     }
      //   })

      //   itIf(
      //     protocol.messages.length > 0,
      //     'signMessageWithKeyPair and verifyMessageWithPublicKey - Is able to sign and verify a message',
      //     async () => {
      //       const { secretKey, publicKey } = await protocol.lib.getKeyPairFromSecret(
      //         { type: 'mnemonic', value: protocol.mnemonic() },
      //         protocolMetadata.account?.standardDerivationPath
      //       )

      //       for (const messageObject of protocol.messages) {
      //         try {
      //           const signature = await protocol.lib.signMessageWithKeyPair(messageObject.message, {
      //             publicKey,
      //             secretKey
      //           })
      //           const signatureIsValid = await protocol.lib.verifyMessageWithPublicKey(messageObject.message, signature, publicKey)

      //           expect(signatureIsValid, 'first signature is invalid').to.be.true

      //           const signature2IsValid = await protocol.lib.verifyMessageWithPublicKey(
      //             `different-message-${messageObject.message}`,
      //             signature,
      //             publicKey
      //           )
      //           expect(signature2IsValid, 'second signature is invalid').to.be.false
      //         } catch (e) {
      //           expect(e.message).to.equal('Method not implemented.')
      //         }
      //       }
      //     }
      //   )
      // })

      // describe(`Encrypt Message Asymmetric`, () => {
      //   afterEach(async () => {
      //     sinon.restore()
      //   })

      //   itIf(
      //     protocol.encryptAsymmetric.length > 0,
      //     'encryptAsymmetricWithPublicKey - Is able to encrypt a message using a PublicKey',
      //     async () => {
      //       // This test probably doesn't serve much of a purpose
      //       const { publicKey } = await protocol.lib.getKeyPairFromSecret(
      //         { type: 'mnemonic', value: protocol.mnemonic() },
      //         protocolMetadata.account?.standardDerivationPath
      //       )

      //       for (const messageObject of protocol.encryptAsymmetric) {
      //         try {
      //           const encryptedPayload = await protocol.lib.encryptAsymmetricWithPublicKey(messageObject.message, publicKey)
      //           expect(encryptedPayload.length).to.equal(messageObject.encrypted.length)
      //         } catch (e) {
      //           expect(e.message).to.equal('Method not implemented.')
      //         }
      //       }
      //     }
      //   )

      //   itIf(
      //     protocol.encryptAsymmetric.length > 0,
      //     'decryptAsymmetricWithKeyPair - Is able to decrypt a message using a SecretKey',
      //     async () => {
      //       const { secretKey, publicKey } = await protocol.lib.getKeyPairFromSecret(
      //         { type: 'mnemonic', value: protocol.mnemonic() },
      //         protocolMetadata.account?.standardDerivationPath
      //       )

      //       for (const messageObject of protocol.encryptAsymmetric) {
      //         try {
      //           const decryptedPayload = await protocol.lib.decryptAsymmetricWithKeyPair(messageObject.encrypted, {
      //             publicKey,
      //             secretKey
      //           } as any)
      //           expect(decryptedPayload).to.equal(messageObject.message)
      //         } catch (e) {
      //           expect(e.message).to.equal('Method not implemented.')
      //         }
      //       }
      //     }
      //   )

      //   itIf(
      //     protocol.encryptAsymmetric.length > 0,
      //     'encryptAsymmetricWithPublicKey and decryptAsymmetricWithKeyPair - Is able to encrypt and decrypt a message',
      //     async () => {
      //       const { secretKey, publicKey } = await protocol.lib.getKeyPairFromSecret(
      //         { type: 'mnemonic', value: protocol.mnemonic() },
      //         protocolMetadata.account?.standardDerivationPath
      //       )

      //       for (const messageObject of protocol.encryptAsymmetric) {
      //         const encryptedPayload = await protocol.lib.encryptAsymmetricWithPublicKey(messageObject.message, publicKey)

      //         try {
      //           const decryptedPayload = await protocol.lib.decryptAsymmetricWithKeyPair(encryptedPayload, {
      //             publicKey,
      //             secretKey
      //           } as any)

      //           expect(decryptedPayload).to.equal(messageObject.message)
      //         } catch (e) {
      //           expect(e.message).to.equal('Method not implemented.')
      //         }
      //       }
      //     }
      //   )
      // })

      // describe(`Encrypt Message Symmetric`, () => {
      //   afterEach(async () => {
      //     sinon.restore()
      //   })

      //   itIf(protocol.encryptAES.length > 0, 'decryptAESWithSecretKey - Is able to encrypt a message using a SecretKey', async () => {
      //     const { secretKey } = await protocol.lib.getKeyPairFromSecret(
      //       { type: 'mnemonic', value: protocol.mnemonic() },
      //       protocolMetadata.account?.standardDerivationPath
      //     )

      //     for (const messageObject of protocol.encryptAES) {
      //       try {
      //         const decryptedPayload = await protocol.lib.decryptAESWithSecretKey(messageObject.encrypted, secretKey)
      //         expect(decryptedPayload).to.equal(messageObject.message)
      //       } catch (e) {
      //         expect(e.message).to.equal('Method not implemented.')
      //       }
      //     }
      //   })

      //   itIf(
      //     protocol.encryptAES.length > 0,
      //     'encryptAESWithSecretKey and decryptAESWithSecretKey - Is able to encrypt and decrypt a message',
      //     async () => {
      //       const { secretKey } = await protocol.lib.getKeyPairFromSecret(
      //         { type: 'mnemonic', value: protocol.mnemonic() },
      //         protocolMetadata.account?.standardDerivationPath
      //       )

      //       for (const messageObject of protocol.encryptAES) {
      //         const encryptedPayload = await protocol.lib.encryptAESWithSecretKey(messageObject.message, secretKey)

      //         try {
      //           const decryptedPayload = await protocol.lib.decryptAESWithSecretKey(encryptedPayload, secretKey)

      //           expect(decryptedPayload).to.equal(messageObject.message)
      //         } catch (e) {
      //           expect(e.message).to.equal('Method not implemented.')
      //         }
      //       }
      //     }
      //   )
      // })

      // describe(`Transactions`, () => {
      //   it('getTransactionFeeWithPublicKey - Is able to get default transaction fee from chain', async () => {
      //     const { publicKey } = await protocol.offlineLib.getKeyPairFromDerivative(await protocol.derivative())

      //     const transactionFee = JSON.parse(JSON.stringify(await protocol.onlineLib.getTransactionFeeWithPublicKey(publicKey, [])))
      //     if (isAmount(transactionFee)) {
      //       expect(transactionFee).to.deep.equal(JSON.parse(JSON.stringify(protocolMetadata.fee?.defaults)).medium)
      //     } else {
      //       expect(transactionFee).to.deep.equal(JSON.parse(JSON.stringify(protocolMetadata.fee?.defaults)))
      //     }
      //   })

      //   it('getTransactionMaxAmountWithPublicKey - Is able to get default transaction fee from chain', async () => {
      //     const { publicKey } = await protocol.offlineLib.getKeyPairFromDerivative(await protocol.derivative())

      //     const balance = await protocol.onlineLib.getBalanceOfPublicKey(publicKey)
      //     const maxAmount = await protocol.onlineLib.getTransactionMaxAmountWithPublicKey(publicKey, [])

      //     // TODO : expect -> maxAmount <= balance - fee
      //     console.log('balance', balance.total.value)
      //     console.log('maxAmount', maxAmount.value)
      //   })
      // })
    })
  })
).then(() => {
  run()
})
