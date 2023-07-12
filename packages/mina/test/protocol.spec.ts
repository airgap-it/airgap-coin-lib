// tslint:disable no-floating-promises
import { AirGapTransaction } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { MinaTestProtocolSpec } from './specs/mina'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new MinaTestProtocolSpec()]

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

        it('getKeyPairFromDerivative - should be able to create a key pair from a derivative (extended keys)', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(
            await protocol.derivative(protocol.wallet.derivationPath)
          )

          expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
          expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
        })

        it('getAddressFromPublicKey - should be able to create a valid address from a supplied publicKey', async () => {
          const { publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative(protocol.wallet.derivationPath))
          const address = await protocol.lib.getAddressFromPublicKey(publicKey)

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
          const preparedTx = await protocol.lib.prepareTransactionWithPublicKey(
            protocol.wallet.publicKey,
            [
              {
                to: protocol.txs[0].to[0],
                amount: protocol.txs[0].amount,
                arbitraryData: protocol.txs[0].memo
              }
            ],
            { fee: protocol.txs[0].fee }
          )

          protocol.txs.forEach((tx) => {
            expect(preparedTx).to.deep.include(tx.unsignedTx)
          })
        })

        it('prepareTransactionWithPublicKey - Is able to prepare a transaction with amount 0', async () => {
          // should not throw an exception when trying to create a 0 TX, given enough funds are available for the gas
          await protocol.stub.registerStub(protocol)

          try {
            await protocol.lib.prepareTransactionWithPublicKey(
              protocol.wallet.publicKey,
              [
                {
                  to: protocol.txs[0].to[0],
                  amount: { value: '0', unit: 'blockchain' },
                  arbitraryData: protocol.txs[0].memo
                }
              ],
              { fee: protocol.txs[0].fee }
            )
          } catch (error) {
            throw error
          }

          await protocol.stub.noBalanceStub(protocol)

          try {
            await protocol.lib.prepareTransactionWithPublicKey(
              protocol.wallet.publicKey,
              [
                {
                  to: protocol.txs[0].to[0],
                  amount: { value: '0', unit: 'blockchain' },
                  arbitraryData: protocol.txs[0].memo
                }
              ],
              { fee: protocol.txs[0].fee }
            )
            throw new Error(`should have failed`)
          } catch (error) {
            expect(error.toString()).to.contain('balance')
          }
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
          const { secretKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative(protocol.wallet.derivationPath))

          for (const { unsignedTx, signedTx } of protocol.txs) {
            const tx = await protocol.lib.signTransactionWithSecretKey(unsignedTx, secretKey)
            expect(tx.signature).to.deep.equal(signedTx.signature)
          }
        })
      })

      describe(`Extract TX`, () => {
        it('getDetailsFromTransaction - Is able to extract all necessary properties from an unsigned TX', async () => {
          for (const tx of protocol.txs) {
            const airgapTxs: AirGapTransaction[] = await protocol.lib.getDetailsFromTransaction(tx.unsignedTx, protocol.wallet.publicKey)

            if (airgapTxs.length !== 1) {
              throw new Error('Unexpected number of transactions')
            }

            const airgapTx: AirGapTransaction = JSON.parse(JSON.stringify(airgapTxs[0]))

            expect(airgapTx.to, 'to property does not match').to.deep.equal(tx.to)
            expect(airgapTx.from, 'from property does not match').to.deep.equal(tx.from)

            expect(airgapTx.amount, 'amount does not match').to.deep.equal(protocol.txs[0].amount)
            expect(airgapTx.fee, 'fee does not match').to.deep.equal(protocol.txs[0].fee)

            expect(airgapTx.arbitraryData, 'arbitraryDetails does not match').to.equal(protocol.txs[0].memo)
          }
        })

        it('getDetailsFromTransaction - Is able to extract all necessary properties from a signed TX', async () => {
          for (const tx of protocol.txs) {
            const airgapTxs: AirGapTransaction[] = await protocol.lib.getDetailsFromTransaction(tx.unsignedTx, protocol.wallet.publicKey)

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
            expect(airgapTx.arbitraryData, 'arbitraryDetails does not match').to.equal(protocol.txs[0].memo)
          }
        })

        it('should match all valid addresses', async () => {
          for (const address of protocol.validAddresses) {
            const match = protocolMetadata.account?.address?.regex ? address.match(protocolMetadata.account.address.regex) : false

            expect(match && match.length > 0, `address: ${address}`).to.be.true
          }
        })
      })
    })
  })
).then(() => {
  run()
})
