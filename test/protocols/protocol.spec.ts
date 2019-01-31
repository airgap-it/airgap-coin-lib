import * as sinon from 'sinon'
import 'mocha'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import { TestProtocolSpec } from './implementations'
import { IAirGapTransaction } from '../../lib'
import { AETestProtocolSpec } from './specs/ae'
import { EthereumTestProtocolSpec } from './specs/ethereum'
import { EthereumRopstenTestProtocolSpec } from './specs/ethereum-ropsten'
import { EthereumClassicTestProtocolSpec } from './specs/ethereum-classic'
import { ERC20HOPTokenTestProtocolSpec } from './specs/erc20-hop-token'
import BigNumber from 'bignumber.js'
import { TezosTestProtocolSpec } from './specs/tezos'
import { BitcoinTestProtocolSpec } from './specs/bitcoin-test'
import { GenericERC20TokenTestProtocolSpec } from './specs/generic-erc20-token'
import { KtTezosTestProtocolSpec } from './specs/kt-tezos'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

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

const protocols = [
  new ERC20HOPTokenTestProtocolSpec(),
  new EthereumTestProtocolSpec(),
  new EthereumClassicTestProtocolSpec(),
  new EthereumRopstenTestProtocolSpec(),
  new AETestProtocolSpec(),
  new TezosTestProtocolSpec(),
  new KtTezosTestProtocolSpec(),
  new BitcoinTestProtocolSpec(),
  new GenericERC20TokenTestProtocolSpec()
]

const itIf = (condition, title, test) => {
  return condition ? it(title, test) : it.skip(title, test)
}

protocols.forEach(async (protocol: TestProtocolSpec) => {
  describe(`ICoinProtocol ${protocol.name}`, () => {
    describe(`Public/Private KeyPair`, () => {
      it('getPublicKeyFromHexSecret - should be able to create a public key from a corresponding hex secret', async () => {
        const publicKey = protocol.lib.getPublicKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)
        expect(publicKey).to.equal(protocol.wallet.publicKey)
      })

      itIf(!protocol.lib.supportsHD, 'getPrivateKeyFromHexSecret - should be able to create a private key from a hex secret', async () => {
        const privateKey = protocol.lib.getPrivateKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)

        // check if privateKey is a Buffer
        expect(privateKey).to.be.instanceof(Buffer)

        // check if privateKey matches to supplied one
        expect(privateKey.toString('hex')).to.equal(protocol.wallet.privateKey)
      })

      itIf(
        protocol.lib.supportsHD,
        'getExtendedPrivateKeyFromHexSecret - should be able to create ext private key from hex secret',
        async () => {
          const privateKey = protocol.lib.getExtendedPrivateKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)

          // check if privateKey matches to supplied one
          expect(privateKey).to.equal(protocol.wallet.privateKey)
        }
      )

      itIf(
        !protocol.lib.supportsHD,
        'getAddressFromPublicKey - should be able to create a valid address from a supplied publicKey',
        async () => {
          const publicKey = protocol.lib.getPublicKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)
          const address = await protocol.lib.getAddressFromPublicKey(publicKey)

          // check if address format matches
          expect(address.match(new RegExp(protocol.lib.addressValidationPattern))).not.to.equal(null)

          // check if address matches to supplied one
          expect(address).to.equal(protocol.wallet.addresses[0], 'address does not match')
        }
      )

      itIf(
        protocol.lib.supportsHD,
        'getAddressFromExtendedPublicKey - should be able to create a valid address from ext publicKey',
        async () => {
          const publicKey = protocol.lib.getPublicKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)
          const address = await protocol.lib.getAddressFromExtendedPublicKey(publicKey, 0, 0)

          // check if address format matches
          expect(address.match(new RegExp(protocol.lib.addressValidationPattern))).not.to.equal(null)

          // check if address matches to supplied one
          expect(address).to.equal(protocol.wallet.addresses[0], 'address does not match')
        }
      )
    })

    describe(`Prepare Transaction`, () => {
      beforeEach(async () => {
        protocol.stub.registerStub(protocol, protocol.lib)
      })

      afterEach(async () => {
        sinon.restore()
      })

      itIf(!protocol.lib.supportsHD, 'prepareTransactionFromPublicKey - Is able to prepare a tx using its public key', async () => {
        let preparedTx = await protocol.lib.prepareTransactionFromPublicKey(
          protocol.wallet.publicKey,
          protocol.wallet.addresses,
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

      itIf(!protocol.lib.supportsHD, 'prepareTransactionFromPublicKey - Is able to prepare a transaction with amount 0', async () => {
        // should not throw an exception when trying to create a 0 TX, given enough funds are available for the gas
        try {
          await protocol.lib.prepareTransactionFromPublicKey(
            protocol.wallet.publicKey,
            protocol.wallet.addresses,
            [new BigNumber(0)],
            protocol.wallet.tx.fee
          )
        } catch (error) {
          throw error
        }

        // restore stubs
        sinon.restore()
        protocol.stub.noBalanceStub(protocol, protocol.lib)

        try {
          await protocol.lib.prepareTransactionFromPublicKey(
            protocol.wallet.publicKey,
            protocol.wallet.addresses,
            [new BigNumber(0)],
            protocol.wallet.tx.fee
          )
          throw new Error(`should have failed`)
        } catch (error) {
          expect(error.toString()).to.contain('balance')
        }
      })
    })

    describe(`Sign Transaction`, () => {
      beforeEach(async () => {
        protocol.stub.registerStub(protocol, protocol.lib)
      })

      afterEach(async () => {
        sinon.restore()
      })

      itIf(!protocol.lib.supportsHD, 'signWithPrivateKey - Is able to sign a transaction using a PrivateKey', async () => {
        const privateKey = protocol.lib.getPrivateKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)
        const txs: any[] = []

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

      itIf(protocol.lib.supportsHD, 'signWithExtendedPrivateKey - Is able to sign a transaction using a PrivateKey', async () => {
        const privateKey = protocol.lib.getExtendedPrivateKeyFromHexSecret(protocol.seed(), protocol.lib.standardDerivationPath)
        const txs: any[] = []

        await Promise.all(
          protocol.txs.map(async ({ unsignedTx }) => {
            const tx = await protocol.lib.signWithExtendedPrivateKey(privateKey, unsignedTx)
            txs.push(tx)
          })
        )

        txs.forEach((tx, index) => {
          expect(tx).to.equal(protocol.txs[index].signedTx)
        })
      })
    })

    describe(`Extract TX`, () => {
      it('getTransactionDetails - Is able to extract all necessary properties from a TX', async () => {
        protocol.txs.forEach(async tx => {
          const airgapTx: IAirGapTransaction = await protocol.lib.getTransactionDetails({
            publicKey: protocol.wallet.publicKey,
            transaction: tx.unsignedTx
          })

          expect(airgapTx.to).to.deep.equal(tx.to)
          expect(airgapTx.from).to.deep.equal(tx.from)

          expect(airgapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
          expect(airgapTx.fee).to.deep.equal(protocol.wallet.tx.fee)

          expect(airgapTx.protocolIdentifier).to.equal(protocol.lib.identifier)
        })
      })

      it('getTransactionDetailsFromSigned - Is able to extract all necessary properties form a TX', async () => {
        protocol.txs.forEach(async tx => {
          const airgapTx: IAirGapTransaction = await protocol.lib.getTransactionDetailsFromSigned({
            accountIdentifier: protocol.wallet.publicKey.substr(-6),
            from: protocol.wallet.addresses,
            amount: protocol.wallet.tx.amount,
            fee: protocol.wallet.tx.fee,
            to: protocol.wallet.addresses,
            transaction: tx.signedTx
          })

          expect(airgapTx.to.map(obj => obj.toLowerCase())).to.deep.equal(tx.to.map(obj => obj.toLowerCase()))
          expect(airgapTx.from.map(obj => obj.toLowerCase())).to.deep.equal(tx.from.map(obj => obj.toLowerCase()))

          expect(airgapTx.amount).to.deep.equal(protocol.wallet.tx.amount)
          expect(airgapTx.fee).to.deep.equal(protocol.wallet.tx.fee)

          expect(airgapTx.protocolIdentifier).to.equal(protocol.lib.identifier)
        })
      })
    })
  })
})
