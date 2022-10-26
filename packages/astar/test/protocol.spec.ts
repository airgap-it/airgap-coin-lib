import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'

import { TestProtocolSpec } from './implementations'
import { AstarTestProtocolSpec } from './specs/astar'
import { ShidenTestProtocolSpec } from './specs/shiden'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

/**
 * We currently test the following ICoinProtocol methods
 *
 * - getPublicKeyFromMnemonic
 * - getPrivateKeyFromMnemonic
 * - getAddressFromPublicKey
 * - prepareTransactionFromPublicKey
 * - signWithPrivateKey
 * - getTransactionDetails
 * - getTransactionDetailsFromRaw
 */

const protocols = [new AstarTestProtocolSpec(), new ShidenTestProtocolSpec()]

const itIf = (condition, title, test) => {
  return condition ? it(title, test) : it.skip(title, test)
}

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    const protocolSupportsHD = await protocol.lib.getSupportsHD()

    describe(`ICoinProtocol ${protocol.name}`, () => {
      describe(`Blockexplorer`, async () => {
        const address = 'dummyAddress'
        const txId = 'dummyTxId'

        const blockExplorerLinkAddress = await protocol.lib.getBlockExplorerLinkForAddress(address)
        const blockExplorerLinkTxId = await protocol.lib.getBlockExplorerLinkForTxId(txId)

        it('should replace address', async () => {
          expect(blockExplorerLinkAddress).to.contain(address)
        })

        it('should replace txId', async () => {
          expect(blockExplorerLinkTxId).to.contain(txId)
        })

        it('should contain blockexplorer url', async () => {
          expect(blockExplorerLinkAddress).to.contain((await protocol.lib.getOptions()).network.blockExplorer.blockExplorer)
          expect(blockExplorerLinkTxId).to.contain((await protocol.lib.getOptions()).network.blockExplorer.blockExplorer)
        })

        it('should not contain placeholder brackets', async () => {
          // Placeholders should be replaced
          expect(blockExplorerLinkAddress).to.not.contain('{{')
          expect(blockExplorerLinkAddress).to.not.contain('}}')
          expect(blockExplorerLinkTxId).to.not.contain('{{')
          expect(blockExplorerLinkTxId).to.not.contain('}}')
        })

        it('should always use https://', async () => {
          expect(blockExplorerLinkAddress).to.not.contain('http://')
          expect(blockExplorerLinkTxId).to.not.contain('http://')
          expect(blockExplorerLinkAddress).to.contain('https://')
          expect(blockExplorerLinkTxId).to.contain('https://')
        })

        it('should never contain 2 / after each other', async () => {
          // We remove "https://" so we can check if the rest of the url contains "//"
          expect(blockExplorerLinkAddress.split('https://').join('')).to.not.contain('//')
          expect(blockExplorerLinkTxId.split('https://').join('')).to.not.contain('//')
        })
      })

      describe(`Public/Private KeyPair`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol, protocol.lib)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('getPublicKeyFromMnemonic - should be able to create a public key from a corresponding mnemonic', async () => {
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())
          expect(publicKey).to.equal(protocol.wallet.publicKey)
        })

        itIf(!protocolSupportsHD, 'getPrivateKeyFromMnemonic - should be able to create a private key from a mnemonic', async () => {
          const privateKey = await protocol.lib.getPrivateKeyFromMnemonic(
            protocol.mnemonic(),
            await protocol.lib.getStandardDerivationPath()
          )

          // check if privateKey matches to supplied one
          expect(privateKey).to.equal(protocol.wallet.privateKey)
        })

        itIf(protocolSupportsHD, 'getExtendedPrivateKeyFromMnemonic - should be able to create ext private key from mnemonic', async () => {
          const privateKey = await protocol.lib.getExtendedPrivateKeyFromMnemonic(
            protocol.mnemonic(),
            await protocol.lib.getStandardDerivationPath()
          )

          // check if privateKey matches to supplied one
          expect(privateKey).to.equal(protocol.wallet.privateKey)
        })

        itIf(
          !protocolSupportsHD,
          'getAddressFromPublicKey - should be able to create a valid address from a supplied publicKey',
          async () => {
            const publicKey = await protocol.lib.getPublicKeyFromMnemonic(
              protocol.mnemonic(),
              await protocol.lib.getStandardDerivationPath()
            )
            const address = await protocol.lib.getAddressFromPublicKey(publicKey)

            // check if address format matches
            expect(address.address.match(new RegExp(await protocol.lib.getAddressValidationPattern()))).not.to.equal(null)

            // check if address matches to supplied one
            expect(address.address).to.equal(protocol.wallet.addresses[0], 'address does not match')
          }
        )

        itIf(
          protocolSupportsHD,
          'getAddressFromExtendedPublicKey - should be able to create a valid address from ext publicKey',
          async () => {
            const publicKey = await protocol.lib.getPublicKeyFromMnemonic(
              protocol.mnemonic(),
              await protocol.lib.getStandardDerivationPath()
            )
            const address = await protocol.lib.getAddressFromExtendedPublicKey(publicKey, 0, 0)

            // check if address format matches
            expect(address.address.match(new RegExp(await protocol.lib.getAddressValidationPattern()))).not.to.equal(null)

            // check if address matches to supplied one
            expect(address.address).to.equal(protocol.wallet.addresses[0], 'address does not match')
          }
        )
      })

      describe(`Prepare Transaction`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol, protocol.lib)
        })

        afterEach(async () => {
          sinon.restore()
        })

        itIf(!protocolSupportsHD, 'prepareTransactionFromPublicKey - Is able to prepare a tx using its public key', async () => {
          const preparedTx = await protocol.lib.prepareTransactionFromPublicKey(
            protocol.wallet.publicKey,
            protocol.txs[0].to,
            [protocol.txs[0].amount],
            protocol.txs[0].fee
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

        itIf(
          protocolSupportsHD,
          'prepareTransactionFromExtendedPublicKey - Is able to prepare a tx using its extended public key',
          async () => {
            const preparedTx = await protocol.lib.prepareTransactionFromExtendedPublicKey(
              protocol.wallet.publicKey,
              0,
              protocol.txs[0].to,
              [protocol.txs[0].amount],
              protocol.txs[0].fee
            )

            protocol.txs.forEach((tx) => {
              if (tx.properties) {
                tx.properties.forEach((property) => {
                  expect(preparedTx).to.have.property(property)
                })
              }
              expect(preparedTx).to.deep.include(tx.unsignedTx)
            })
          }
        )

        itIf(!protocolSupportsHD, 'prepareTransactionFromPublicKey - Is able to prepare a transaction with amount 0', async () => {
          // should not throw an exception when trying to create a 0 TX, given enough funds are available for the gas
          try {
            await protocol.lib.prepareTransactionFromPublicKey(protocol.wallet.publicKey, protocol.txs[0].to, ['0'], protocol.txs[0].fee)
          } catch (error) {
            throw error
          }

          // restore stubs
          sinon.restore()
          await protocol.stub.noBalanceStub(protocol, protocol.lib)

          try {
            await protocol.lib.prepareTransactionFromPublicKey(protocol.wallet.publicKey, protocol.txs[0].to, ['0'], protocol.txs[0].fee)
            throw new Error(`should have failed`)
          } catch (error) {
            expect(error.toString()).to.contain('balance')
          }
        })
      })

      describe(`Sign Transaction`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol, protocol.lib)
        })

        afterEach(async () => {
          sinon.restore()
        })

        itIf(!protocolSupportsHD, 'signWithPrivateKey - Is able to sign a transaction using a PrivateKey', async () => {
          const privateKey = await protocol.lib.getPrivateKeyFromMnemonic(
            protocol.mnemonic(),
            await protocol.lib.getStandardDerivationPath()
          )
          const txs: any[] = []

          for (const { unsignedTx } of protocol.txs) {
            const tx = await protocol.lib.signWithPrivateKey(privateKey, unsignedTx)
            txs.push(tx)
          }

          for (let index = 0; index < txs.length; index++) {
            if (protocol.verifySignature) {
              expect(await protocol.verifySignature(protocol.wallet.publicKey, txs[index])).to.be.true
            } else {
              expect(txs[index]).to.deep.equal(protocol.txs[index].signedTx)
            }
          }
        })

        itIf(protocolSupportsHD, 'signWithExtendedPrivateKey - Is able to sign a transaction using a PrivateKey', async () => {
          const privateKey = await protocol.lib.getExtendedPrivateKeyFromMnemonic(
            protocol.mnemonic(),
            await protocol.lib.getStandardDerivationPath()
          )
          const txs: any[] = []

          for (const { unsignedTx } of protocol.txs) {
            const tx = await protocol.lib.signWithExtendedPrivateKey(privateKey, unsignedTx)
            txs.push(tx)
          }

          for (let index = 0; index < txs.length; index++) {
            if (protocol.verifySignature) {
              expect(await protocol.verifySignature(protocol.wallet.publicKey, txs[index])).to.be.true
            } else {
              expect(txs[index]).to.deep.equal(protocol.txs[index].signedTx)
            }
          }
        })
      })

      describe(`Extract TX`, () => {
        it('getTransactionDetails - Is able to extract all necessary properties from a TX', async () => {
          for (const tx of protocol.txs) {
            const airgapTxs: IAirGapTransaction[] = await protocol.lib.getTransactionDetails({
              publicKey: protocol.wallet.publicKey,
              transaction: tx.unsignedTx
            })

            if (airgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }

            const airgapTx: IAirGapTransaction = airgapTxs[0]

            expect(airgapTx.to, 'to property does not match').to.deep.equal(tx.to)
            expect(airgapTx.from, 'from property does not match').to.deep.equal(tx.from)

            expect(airgapTx.amount, 'amount does not match').to.deep.equal(protocol.txs[0].amount)
            expect(airgapTx.fee, 'fee does not match').to.deep.equal(protocol.txs[0].fee)

            expect(airgapTx.protocolIdentifier, 'protocol-identifier does not match').to.equal(await protocol.lib.getIdentifier())

            expect(airgapTx.transactionDetails, 'extras should exist').to.not.be.undefined
          }
        })

        it('getTransactionDetailsFromSigned - Is able to extract all necessary properties from a TX', async () => {
          for (const tx of protocol.txs) {
            // tslint:disable-next-line:no-any
            const transaction: any = {
              accountIdentifier: protocol.wallet.publicKey.substr(-6),
              from: protocol.wallet.addresses,
              amount: protocol.txs[0].amount,
              fee: protocol.txs[0].fee,
              to: protocol.wallet.addresses,
              transaction: tx.signedTx
            }
            const airgapTxs: IAirGapTransaction[] = await protocol.lib.getTransactionDetailsFromSigned(transaction)
            if (airgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }
            const airgapTx: IAirGapTransaction = airgapTxs[0]
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
            expect(airgapTx.protocolIdentifier).to.equal(await protocol.lib.getIdentifier())
            expect(airgapTx.transactionDetails, 'extras should exist').to.not.be.undefined
          }
        })

        it('should match all valid addresses', async () => {
          for (const address of protocol.validAddresses) {
            const match = address.match(await protocol.lib.getAddressValidationPattern())

            expect(match && match.length > 0, `address: ${address}`).to.be.true
          }
        })

        it('getTransactionStatus - Is able to get transaction status', async () => {
          const tests = protocol.transactionStatusTests

          for (let i = 0; i < tests.length; i++) {
            const statuses: string[] = await protocol.lib.getTransactionStatuses(tests[i].hashes)
            sinon.restore()
            expect(statuses, 'transactionStatus').to.deep.equal(tests[i].expectedResults)
          }
        })
      })

      describe(`Sign Message`, async () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(
          protocol.messages.length > 0 &&
            (await protocol.lib.getIdentifier()) !== 'kusama' &&
            (await protocol.lib.getIdentifier()) !== 'polkadot',
          'signMessage - Is able to sign a message using a PrivateKey',
          async () => {
            const publicKey = await protocol.lib.getPublicKeyFromMnemonic(
              protocol.mnemonic(),
              await protocol.lib.getStandardDerivationPath()
            )
            const privateKey = await protocol.lib.getPrivateKeyFromMnemonic(
              protocol.mnemonic(),
              await protocol.lib.getStandardDerivationPath()
            )

            for (const messageObject of protocol.messages) {
              try {
                const signature = await protocol.lib.signMessage(messageObject.message, {
                  publicKey,
                  privateKey
                })
                expect(signature).to.equal(messageObject.signature)
              } catch (e) {
                expect(e.message).to.equal('Method not implemented.')
              }
            }
          }
        )

        itIf(protocol.messages.length > 0, 'verifyMessage - Is able to verify a message using a PublicKey', async () => {
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

          for (const messageObject of protocol.messages) {
            try {
              const signatureIsValid = await protocol.lib.verifyMessage(messageObject.message, messageObject.signature, publicKey)

              expect(signatureIsValid).to.be.true
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(protocol.messages.length > 0, 'signMessage and verifyMessage - Is able to sign and verify a message', async () => {
          const privateKey = await protocol.lib.getPrivateKeyFromMnemonic(
            protocol.mnemonic(),
            await protocol.lib.getStandardDerivationPath()
          )
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

          for (const messageObject of protocol.messages) {
            try {
              const signature = await protocol.lib.signMessage(messageObject.message, {
                publicKey,
                privateKey
              })
              const signatureIsValid = await protocol.lib.verifyMessage(messageObject.message, signature, publicKey)

              expect(signatureIsValid, 'first signature is invalid').to.be.true

              const signature2IsValid = await protocol.lib.verifyMessage(`different-message-${messageObject.message}`, signature, publicKey)
              expect(signature2IsValid, 'second signature is invalid').to.be.false
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })
      })

      describe(`Encrypt Message Asymmetric`, () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(protocol.encryptAsymmetric.length > 0, 'encryptAsymmetric - Is able to encrypt a message using a PublicKey', async () => {
          // This test probably doesn't serve much of a purpose
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

          for (const messageObject of protocol.encryptAsymmetric) {
            try {
              const encryptedPayload = await protocol.lib.encryptAsymmetric(messageObject.message, publicKey)
              expect(encryptedPayload.length).to.equal(messageObject.encrypted.length)
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(protocol.encryptAsymmetric.length > 0, 'decryptAsymmetric - Is able to decrypt a message using a PrivateKey', async () => {
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())
          const privateKey =
            (await protocol.lib.getIdentifier()) === 'btc' || (await protocol.lib.getIdentifier()) === 'grs'
              ? await protocol.lib.getExtendedPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())
              : await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

          for (const messageObject of protocol.encryptAsymmetric) {
            try {
              const decryptedPayload = await protocol.lib.decryptAsymmetric(messageObject.encrypted, {
                publicKey,
                privateKey
              } as any)
              expect(decryptedPayload).to.equal(messageObject.message)
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(
          protocol.encryptAsymmetric.length > 0,
          'encryptAsymmetric and decryptAsymmetric - Is able to encrypt and decrypt a message',
          async () => {
            const publicKey = await protocol.lib.getPublicKeyFromMnemonic(
              protocol.mnemonic(),
              await protocol.lib.getStandardDerivationPath()
            )
            const privateKey =
              (await protocol.lib.getIdentifier()) === 'btc' || (await protocol.lib.getIdentifier()) === 'grs'
                ? await protocol.lib.getExtendedPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())
                : await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

            for (const messageObject of protocol.encryptAsymmetric) {
              const encryptedPayload = await protocol.lib.encryptAsymmetric(messageObject.message, publicKey)

              try {
                const decryptedPayload = await protocol.lib.decryptAsymmetric(encryptedPayload, {
                  publicKey,
                  privateKey
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

        itIf(protocol.encryptAES.length > 0, 'decryptAES - Is able to encrypt a message using a PrivateKey', async () => {
          const privateKey =
            (await protocol.lib.getIdentifier()) === 'btc' || (await protocol.lib.getIdentifier()) === 'grs'
              ? await protocol.lib.getExtendedPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())
              : await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

          for (const messageObject of protocol.encryptAES) {
            try {
              const decryptedPayload = await protocol.lib.decryptAES(messageObject.encrypted, privateKey)
              expect(decryptedPayload).to.equal(messageObject.message)
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })

        itIf(protocol.encryptAES.length > 0, 'encryptAES and decryptAES - Is able to encrypt and decrypt a message', async () => {
          const privateKey =
            (await protocol.lib.getIdentifier()) === 'btc' || (await protocol.lib.getIdentifier()) === 'grs'
              ? await protocol.lib.getExtendedPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())
              : await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), await protocol.lib.getStandardDerivationPath())

          for (const messageObject of protocol.encryptAES) {
            const encryptedPayload = await protocol.lib.encryptAES(messageObject.message, privateKey)

            try {
              const decryptedPayload = await protocol.lib.decryptAES(encryptedPayload, privateKey)

              expect(decryptedPayload).to.equal(messageObject.message)
            } catch (e) {
              expect(e.message).to.equal('Method not implemented.')
            }
          }
        })
      })
    })
  })
).then(() => {
  run()
})
