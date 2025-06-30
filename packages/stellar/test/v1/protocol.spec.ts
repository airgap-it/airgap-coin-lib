// tslint:disable no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementations'
import { StellarTestProtocolSpec } from './specs/stellar'
import { Networks, Operation, Transaction, TransactionBuilder } from '@stellar/stellar-sdk'

chai.use(chaiAsPromised)
const expect = chai.expect

const protocols: TestProtocolSpec[] = [new StellarTestProtocolSpec()]

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec) => {
    const protocolMetadata = await protocol.lib.getMetadata()

    describe(`Protocol ${protocol.name}`, () => {
      describe(`KeyPair`, () => {
        it('getKeyPairFromDerivative - should create key pair from derivative', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

          expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
          expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
        })

        it('getAddressFromPublicKey - should generate valid address', async () => {
          const { publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          const address = await protocol.lib.getAddressFromPublicKey(publicKey)

          if (protocolMetadata.account?.address?.regex) {
            expect(address.match(new RegExp(protocolMetadata.account.address.regex))).not.to.equal(null)
          }

          expect(address).to.equal(protocol.wallet.addresses[0])
        })
      })

      describe(`Prepare Transaction`, () => {
        beforeEach(async () => {
          sinon.useFakeTimers({ now: new Date('2023-01-01T00:00:00Z') })
          await protocol.stub.loadAccountStub(protocol, protocol.wallet.addresses[0])
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('prepareTransactionWithPublicKey - should prepare tx from public key', async () => {
          const preparedTx = await protocol.lib.prepareTransactionWithPublicKey(
            protocol.wallet.publicKey,
            [
              {
                to: protocol.txs[0].to[0],
                amount: protocol.txs[0].amount
              }
            ],
            { fee: protocol.txs[0].fee }
          )

          expect(preparedTx).to.deep.include(protocol.txs[0].unsignedTx)
        })
      })

      describe(`Sign Transaction`, () => {
        it('signTransactionWithSecretKey - should sign tx correctly', async () => {
          const { secretKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          const tx = await protocol.lib.signTransactionWithSecretKey(protocol.txs[0].unsignedTx, secretKey)

          expect(tx).to.deep.equal(protocol.txs[0].signedTx)
        })
      })

      describe(`Extract TX`, () => {
        it('getDetailsFromTransaction - from unsigned TX', async () => {
          const tx = await protocol.lib.getDetailsFromTransaction(protocol.txs[0].unsignedTx, protocol.wallet.publicKey)

          expect(tx[0].to).to.deep.equal(protocol.txs[0].to)
          expect(tx[0].from).to.deep.equal(protocol.txs[0].from)
          expect(tx[0].amount).to.deep.equal(protocol.txs[0].amount)
          expect(tx[0].fee).to.deep.equal(protocol.txs[0].fee)
        })

        it('getDetailsFromTransaction - from signed TX', async () => {
          const tx = await protocol.lib.getDetailsFromTransaction(protocol.txs[0].signedTx, protocol.wallet.publicKey)

          expect(tx[0].to).to.deep.equal(protocol.txs[0].to)
          expect(tx[0].from).to.deep.equal(protocol.txs[0].from)
          expect(tx[0].amount).to.deep.equal(protocol.txs[0].amount)
          expect(tx[0].fee).to.deep.equal(protocol.txs[0].fee)
        })
      })

      describe(`confirm Multisig`, () => {
        beforeEach(async () => {
          sinon.useFakeTimers({ now: new Date('2023-01-01T00:00:00Z') })

          await protocol.stub.loadAccountStub(protocol, protocol.wallet.addresses[0])
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('getMultisigStatus - should confirm multisig status', async () => {
          const multisigStatus = await protocol.lib.getMultisigStatus(protocol.wallet.publicKey)

          expect(multisigStatus).to.be.true
        })

        it('getThresholds - should get multisig thresholds', async () => {
          const multisigThresholds = await protocol.lib.getThresholds(protocol.wallet.publicKey)

          expect(multisigThresholds.low_threshold).to.be.equal(2)
          expect(multisigThresholds.med_threshold).to.be.equal(2)
          expect(multisigThresholds.high_threshold).to.be.equal(2)
        })

        it('adjustSigner - should be able to adjust multisig parameters', async () => {
          const ajustSignerXDR = await protocol.lib.adjustSigner(
            protocol.wallet.publicKey,
            {
              value: protocol.validAddresses[1],
              format: 'encoded',
              type: 'pub'
            },
            2,
            3,
            3,
            3
          )

          const tx = TransactionBuilder.fromXDR(ajustSignerXDR.transaction, Networks.PUBLIC) as Transaction

          const op = tx.operations[0] as Operation.SetOptions

          expect(op.lowThreshold).to.be.equal(3)
          expect(op.medThreshold).to.be.equal(3)
          expect(op.highThreshold).to.be.equal(3)
          expect(ajustSignerXDR).to.deep.equal(protocol.setOptions.unsignedTx)
        })
      })
    })
  })
).then(() => run())
