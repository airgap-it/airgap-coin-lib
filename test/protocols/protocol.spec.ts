import { expect } from 'chai'
import { seed, TestProtocolSpec } from './implementations'
import * as sinon from 'sinon'
import 'mocha'
import { IAirGapTransaction } from '../../dist'
import { aeProtocol } from './specs/ae'
import { ethereumProtocol } from './specs/ethereum'
import { ethereumRopstenProtocol } from './specs/ethereum-ropsten'
import { ethereumClassicProtocol } from './specs/ethereum-classic'
import { erc20HopRopstenToken } from './specs/erc20-hop-token'

/**
 * We currently test the following ICoinProtocol methods
 *
 * - getPublicKeyFromHexSecret
 * - getPrivateKeyFromHexSecret
 * - getAddressFromPublicKey
 * - prepareTransactionFromPublicKey
 * - signWithPrivateKey
 * - getTransactionDetails
 * - getTransactionDetailsFromRaw
 */

const protocols = [erc20HopRopstenToken, aeProtocol, ethereumProtocol, ethereumRopstenProtocol, ethereumClassicProtocol]

protocols.forEach((protocol: TestProtocolSpec) => {
  describe(`ICoinProtocol ${protocol.name}`, () => {
    describe(`Public/Private KeyPair`, () => {
      it('getPublicKeyFromHexSecret - should be able to create a public key from a corresponding hex secret', () => {
        const publicKey = protocol.lib.getPublicKeyFromHexSecret(seed, protocol.lib.standardDerivationPath)
        expect(publicKey).to.equal(protocol.wallet.publicKey)
      })

      it('getPrivateKeyFromHexSecret - should be able to create a private key from a corresponding hex secret', () => {
        const privateKey = protocol.lib.getPrivateKeyFromHexSecret(seed, protocol.lib.standardDerivationPath)

        // check if privateKey is a Buffer
        expect(privateKey).to.be.instanceof(Buffer)
      })

      it('getAddressFromPublicKey - should be able to create a valid address from a supplied publicKey', () => {
        const publicKey = protocol.lib.getPublicKeyFromHexSecret(seed, protocol.lib.standardDerivationPath)
        const address = protocol.lib.getAddressFromPublicKey(publicKey)

        // check if address format matches
        expect(address.match(new RegExp(protocol.lib.addressValidationPattern))).not.to.equal(null)
        expect(address).to.equal(protocol.wallet.address, 'address does not match')
      })
    })

    describe(`Prepare Transaction`, () => {
      beforeEach(() => {
        protocol.stub.registerStub(protocol, protocol.lib)
      })

      afterEach(() => {
        sinon.restore()
      })

      it('prepareTransactionFromPublicKey - Is able to prepare a transaction using its public key', async function() {
        let preparedTx = await protocol.lib.prepareTransactionFromPublicKey(
          protocol.wallet.publicKey,
          [protocol.wallet.address],
          [protocol.wallet.tx.amount],
          protocol.wallet.tx.fee
        )

        protocol.txs.forEach(tx => {
          if (tx.properties) {
            tx.properties.forEach(property => {
              expect(preparedTx).to.have.property(property)
            })
          }
          expect(preparedTx).to.deep.include(tx.unsignedTx)
        })
      })
    })

    describe(`Sign Transaction`, () => {
      beforeEach(() => {
        protocol.stub.registerStub(protocol, protocol.lib)
      })

      afterEach(() => {
        sinon.restore()
      })

      it('signWithPrivateKey - Is able to sign a transaction using a PrivateKey', async function() {
        const privateKey = protocol.lib.getPrivateKeyFromHexSecret(seed, protocol.lib.standardDerivationPath)
        const txs: string[] = []

        await Promise.all(
          protocol.txs.map(async ({ unsignedTx }) => {
            const tx = await protocol.lib.signWithPrivateKey(privateKey, unsignedTx)
            txs.push(tx)
          })
        )

        txs.forEach((tx, index) => {
          expect(tx).to.equal(protocol.txs[index].signedTx)
        })
      })
    })

    describe(`Extract TX`, () => {
      it('getTransactionDetails - Is able to extract all necessary properties from a TX', async function() {
        protocol.txs.forEach(tx => {
          const airgapTx: IAirGapTransaction = protocol.lib.getTransactionDetails(tx.unsignedTx)

          expect(airgapTx.to).to.deep.equal([protocol.wallet.address])
          expect(airgapTx.from).to.deep.equal([protocol.wallet.address])

          expect(airgapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
          expect(airgapTx.fee).to.deep.equal(protocol.wallet.tx.fee)

          expect(airgapTx.protocolIdentifier).to.equal(protocol.lib.identifier)
        })
      })

      it('getTransactionDetailsFromRaw - Is able to extract all necessary properties form a TX', async function() {
        protocol.txs.forEach(tx => {
          const airgapTx: IAirGapTransaction = protocol.lib.getTransactionDetailsFromRaw(
            tx.unsignedTx,
            JSON.parse(JSON.stringify(tx.signedTx))
          )

          expect(airgapTx.to.map(obj => obj.toLowerCase())).to.deep.equal([protocol.wallet.address].map(obj => obj.toLowerCase()))
          expect(airgapTx.from.map(obj => obj.toLowerCase())).to.deep.equal([protocol.wallet.address].map(obj => obj.toLowerCase()))

          expect(airgapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
          expect(airgapTx.fee).to.deep.equal(protocol.wallet.tx.fee)

          expect(airgapTx.protocolIdentifier).to.equal(protocol.lib.identifier)
        })
      })
    })
  })
})
