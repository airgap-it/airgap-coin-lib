import { AirGapTransaction, Amount } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

// tslint:disable no-floating-promises
import { TestProtocolSpec } from './implementations'
import { GroestlcoinProtocolSpec } from './specs/groestlcoin'
import { GroestlcoinUnits } from 'packages/groestlcoin/src/v1'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new GroestlcoinProtocolSpec()]

const itIf = (condition, title, test) => {
  return condition ? it(title, test) : it.skip(title, test)
}

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    const protocolMetadata = await protocol.lib.getMetadata()

    describe(`Protocol ${protocol.name}`, () => {
      describe(`KeyPair`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        itIf(
          protocol.wallet.publicKey !== undefined && protocol.wallet.secretKey !== undefined,
          'getKeyPairFromDerivative - should be able to create a key pair from a derivative (extended keys)',
          async () => {
            const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

            expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
            expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
          }
        )

        it('getExtendedKeyPairFromDerivative - should be able to create an extended key pair from a derivative (extended keys)', async () => {
          const { secretKey, publicKey } = await protocol.lib.getExtendedKeyPairFromDerivative(await protocol.derivative())

          expect(secretKey).to.deep.equal(protocol.wallet.extendedSecretKey)
          expect(publicKey).to.deep.equal(protocol.wallet.extendedPublicKey)
        })

        it('deriveFromExtendedKey and getAddressFromPublicKey - should be able to derive a public key from an extended public key and derive an address from it', async () => {
          const derivedPublicKey = await protocol.lib.deriveFromExtendedPublicKey(protocol.wallet.extendedPublicKey, 0, 0)
          const address = await protocol.lib.getAddressFromPublicKey(derivedPublicKey)

          if (protocolMetadata.account?.address?.regex !== undefined) {
            // check if address format matches
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

        it('prepareTransactionWithPublicKey - Is able to prepare a tx using its extended public key', async () => {
          const amount = { value: protocol.txs[0].unsignedTx.outs[0].value, unit: 'blockchain' } as Amount<GroestlcoinUnits>

          const preparedTx = await protocol.lib.prepareTransactionWithPublicKey(
            protocol.wallet.extendedPublicKey,
            [
              {
                to: protocol.txs[0].to[0],
                amount: amount
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
      })

      describe(`Sign Transaction`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('signTransactionWithSecretKey - Is able to sign a transaction using an ExtendedSecretKey', async () => {
          const { secretKey } = await protocol.lib.getExtendedKeyPairFromDerivative(await protocol.derivative())
          const txs: any[] = []

          for (const { unsignedTx } of protocol.txs) {
            const tx = await protocol.lib.signTransactionWithSecretKey(unsignedTx, secretKey)
            txs.push(tx)
          }

          for (let index = 0; index < txs.length; index++) {
            expect(txs[index]).to.deep.equal(protocol.txs[index].signedTx)
          }
        })
      })

      describe(`Extract TX`, () => {
        it('getDetailsFromTransaction - Is able to extract all necessary properties from an unsigned TX', async () => {
          for (const tx of protocol.txs) {
            const airgapTxs: AirGapTransaction[] = await protocol.lib.getDetailsFromTransaction(
              tx.unsignedTx,
              protocol.wallet.extendedPublicKey
            )

            if (airgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }

            const airgapTx: AirGapTransaction = JSON.parse(JSON.stringify(airgapTxs[0]))

            expect(airgapTx.to, 'to property does not match').to.deep.equal(tx.to)
            expect(airgapTx.from, 'from property does not match').to.deep.equal(tx.from)

            expect(airgapTx.amount, 'amount does not match').to.deep.equal(protocol.txs[0].amount)
            expect(airgapTx.fee, 'fee does not match').to.deep.equal(protocol.txs[0].fee)
          }
        })

        it('getDetailsFromTransaction - Is able to extract all necessary properties from a signed TX', async () => {
          for (const tx of protocol.txs) {
            const airgapTxs: AirGapTransaction[] = await protocol.lib.getDetailsFromTransaction(
              tx.signedTx,
              protocol.wallet.extendedPublicKey
            )

            if (airgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }

            const airgapTx: AirGapTransaction = JSON.parse(JSON.stringify(airgapTxs[0]))
            expect(
              airgapTx.to.map((obj) => obj.toLowerCase()),
              'from'
            ).to.deep.equal(tx.to.map((obj) => obj.toLowerCase()))
            expect(
              airgapTx.from.sort().map((obj) => obj.toLowerCase()),
              'to'
            ).to.deep.equal(tx.from.sort().map((obj) => obj.toLowerCase()))
            expect(airgapTx.amount).to.deep.equal(protocol.txs[0].amount)
            expect(airgapTx.fee).to.deep.equal(protocol.txs[0].fee)
          }
        })

        it('should match all valid addresses', async () => {
          for (const address of protocol.validAddresses) {
            const match = protocolMetadata.account?.address?.regex ? address.match(protocolMetadata.account.address.regex) : false

            expect(match && match.length > 0, `address: ${address}`).to.be.true
          }
        })
      })

      describe(`Sign Message`, async () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(protocol.messages.length > 0, 'signMessageWithKeyPair - Is able to sign a message using a PrivateKey', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

          for (const messageObject of protocol.messages) {
            try {
              const signature = await protocol.lib.signMessageWithKeyPair(messageObject.message, {
                publicKey,
                secretKey
              })
              expect(signature).to.deep.equal(messageObject.signature)
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(protocol.messages.length > 0, 'verifyMessageWithPublicKey - Is able to verify a message using a PublicKey', async () => {
          const { publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

          for (const messageObject of protocol.messages) {
            try {
              const signatureIsValid = await protocol.lib.verifyMessageWithPublicKey(
                messageObject.message,
                messageObject.signature,
                publicKey
              )

              expect(signatureIsValid).to.be.true
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(
          protocol.messages.length > 0,
          'signMessageWithKeyPair and verifyMessageWithPublicKey - Is able to sign and verify a message',
          async () => {
            const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

            for (const messageObject of protocol.messages) {
              try {
                const signature = await protocol.lib.signMessageWithKeyPair(messageObject.message, {
                  publicKey,
                  secretKey
                })
                const signatureIsValid = await protocol.lib.verifyMessageWithPublicKey(messageObject.message, signature, publicKey)

                expect(signatureIsValid, 'first signature is invalid').to.be.true

                const signature2IsValid = await protocol.lib.verifyMessageWithPublicKey(
                  `different-message-${messageObject.message}`,
                  signature,
                  publicKey
                )
                expect(signature2IsValid, 'second signature is invalid').to.be.false
              } catch (e) {
                expect(e.message).to.equal('Method not implemented.')
              }
            }
          }
        )
      })

      describe(`Encrypt Message Asymmetric`, () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(
          protocol.encryptAsymmetric.length > 0,
          'encryptAsymmetricWithPublicKey - Is able to encrypt a message using a PublicKey',
          async () => {
            // This test probably doesn't serve much of a purpose
            const { publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

            for (const messageObject of protocol.encryptAsymmetric) {
              try {
                const encryptedPayload = await protocol.lib.encryptAsymmetricWithPublicKey(messageObject.message, publicKey)
                expect(encryptedPayload.length).to.equal(messageObject.encrypted.length)
              } catch (e) {
                expect(e.message).to.equal('Method not implemented.')
              }
            }
          }
        )

        itIf(
          protocol.encryptAsymmetric.length > 0,
          'decryptAsymmetricWithKeyPair - Is able to decrypt a message using a SecretKey',
          async () => {
            const { secretKey, publicKey } = await protocol.lib.getExtendedKeyPairFromDerivative(await protocol.derivative())

            for (const messageObject of protocol.encryptAsymmetric) {
              try {
                const decryptedPayload = await protocol.lib.decryptAsymmetricWithKeyPair(messageObject.encrypted, {
                  publicKey,
                  secretKey
                } as any)
                expect(decryptedPayload).to.equal(messageObject.message)
              } catch (e) {
                expect(e.message).to.equal('Method not implemented.')
              }
            }
          }
        )

        itIf(
          protocol.encryptAsymmetric.length > 0,
          'encryptAsymmetricWithPublicKey and decryptAsymmetricWithKeyPair - Is able to encrypt and decrypt a message',
          async () => {
            const { secretKey, publicKey } = await protocol.lib.getExtendedKeyPairFromDerivative(await protocol.derivative())

            for (const messageObject of protocol.encryptAsymmetric) {
              const encryptedPayload = await protocol.lib.encryptAsymmetricWithPublicKey(messageObject.message, publicKey)

              try {
                const decryptedPayload = await protocol.lib.decryptAsymmetricWithKeyPair(encryptedPayload, {
                  publicKey,
                  secretKey
                } as any)

                expect(decryptedPayload).to.equal(messageObject.message)
              } catch (e) {
                expect(e.message).to.equal('Method not implemented.')
              }
            }
          }
        )
      })

      describe(`Encrypt Message Symmetric`, () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(protocol.encryptAES.length > 0, 'decryptAESWithSecretKey - Is able to encrypt a message using a SecretKey', async () => {
          const { secretKey } = await protocol.lib.getExtendedKeyPairFromDerivative(await protocol.derivative())

          for (const messageObject of protocol.encryptAES) {
            try {
              const decryptedPayload = await protocol.lib.decryptAESWithSecretKey(messageObject.encrypted, secretKey)
              expect(decryptedPayload).to.equal(messageObject.message)
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(
          protocol.encryptAES.length > 0,
          'encryptAESWithSecretKey and decryptAESWithSecretKey - Is able to encrypt and decrypt a message',
          async () => {
            const { secretKey } = await protocol.lib.getExtendedKeyPairFromDerivative(await protocol.derivative())

            for (const messageObject of protocol.encryptAES) {
              const encryptedPayload = await protocol.lib.encryptAESWithSecretKey(messageObject.message, secretKey)

              try {
                const decryptedPayload = await protocol.lib.decryptAESWithSecretKey(encryptedPayload, secretKey)

                expect(decryptedPayload).to.equal(messageObject.message)
              } catch (e) {
                expect(e.message).to.equal('Method not implemented.')
              }
            }
          }
        )
      })
    })
  })
).then(() => {
  run()
})
