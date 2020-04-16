import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'
import * as sinon from 'sinon'

import { IAirGapTransaction, SubstrateProtocol } from '../../src'

import { TestProtocolSpec } from './implementations'
import { AETestProtocolSpec } from './specs/ae'
import { BitcoinProtocolSpec } from './specs/bitcoin'
import { BitcoinTestProtocolSpec } from './specs/bitcoin-test'
import { CosmosTestProtocolSpec } from './specs/cosmos'
import { EthereumTestProtocolSpec } from './specs/ethereum'
import { EthereumClassicTestProtocolSpec } from './specs/ethereum-classic'
import { EthereumRopstenTestProtocolSpec } from './specs/ethereum-ropsten'
import { GenericERC20TokenTestProtocolSpec } from './specs/generic-erc20-token'
import { GroestlcoinProtocolSpec } from './specs/groestl'
import { TezosTestProtocolSpec } from './specs/tezos'
import { KusamaTestProtocolSpec } from './specs/kusama'
import { sr25519Verify } from '@polkadot/wasm-crypto'

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

const protocols = [
  new CosmosTestProtocolSpec(),
  new EthereumTestProtocolSpec(),
  new EthereumClassicTestProtocolSpec(),
  new EthereumRopstenTestProtocolSpec(),
  new AETestProtocolSpec(),
  new TezosTestProtocolSpec(),
  new BitcoinProtocolSpec(),
  new BitcoinTestProtocolSpec(),
  new GenericERC20TokenTestProtocolSpec(),
  new GroestlcoinProtocolSpec(),
  new KusamaTestProtocolSpec()
]

const itIf = (condition, title, test) => {
  return condition ? it(title, test) : it.skip(title, test)
}

protocols.forEach(async (protocol: TestProtocolSpec) => {
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
        expect(blockExplorerLinkAddress).to.contain(protocol.lib.blockExplorer)
        expect(blockExplorerLinkTxId).to.contain(protocol.lib.blockExplorer)
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
        protocol.stub.registerStub(protocol, protocol.lib)
      })

      afterEach(async () => {
        sinon.restore()
      })

      it('getPublicKeyFromMnemonic - should be able to create a public key from a corresponding mnemonic', async () => {
        const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
        expect(publicKey).to.equal(protocol.wallet.publicKey)
      })

      itIf(!protocol.lib.supportsHD, 'getPrivateKeyFromMnemonic - should be able to create a private key from a mnemonic', async () => {
        const privateKey = await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)

        // check if privateKey is a Buffer
        expect(privateKey).to.be.instanceof(Buffer)

        // check if privateKey matches to supplied one
        expect(privateKey.toString('hex')).to.equal(protocol.wallet.privateKey)
      })

      itIf(
        protocol.lib.supportsHD,
        'getExtendedPrivateKeyFromMnemonic - should be able to create ext private key from mnemonic',
        async () => {
          const privateKey = await protocol.lib.getExtendedPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)

          // check if privateKey matches to supplied one
          expect(privateKey).to.equal(protocol.wallet.privateKey)
        }
      )

      itIf(
        !protocol.lib.supportsHD,
        'getAddressFromPublicKey - should be able to create a valid address from a supplied publicKey',
        async () => {
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
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
          const publicKey = await protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
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
        const preparedTx = await protocol.lib.prepareTransactionFromPublicKey(
          protocol.wallet.publicKey,
          protocol.txs[0].to,
          [protocol.txs[0].amount],
          protocol.txs[0].fee
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

      itIf(
        protocol.lib.supportsHD,
        'prepareTransactionFromExtendedPublicKey - Is able to prepare a tx using its extended public key',
        async () => {
          const preparedTx = await protocol.lib.prepareTransactionFromExtendedPublicKey(
            protocol.wallet.publicKey,
            0,
            protocol.txs[0].to,
            [protocol.txs[0].amount],
            protocol.txs[0].fee
          )

          protocol.txs.forEach(tx => {
            if (tx.properties) {
              tx.properties.forEach(property => {
                expect(preparedTx).to.have.property(property)
              })
            }
            expect(preparedTx).to.deep.include(tx.unsignedTx)
          })
        }
      )

      itIf(!protocol.lib.supportsHD, 'prepareTransactionFromPublicKey - Is able to prepare a transaction with amount 0', async () => {
        // should not throw an exception when trying to create a 0 TX, given enough funds are available for the gas
        try {
          await protocol.lib.prepareTransactionFromPublicKey(protocol.wallet.publicKey, protocol.txs[0].to, ['0'], protocol.txs[0].fee)
        } catch (error) {
          throw error
        }

        // restore stubs
        sinon.restore()
        protocol.stub.noBalanceStub(protocol, protocol.lib)

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
        protocol.stub.registerStub(protocol, protocol.lib)
      })

      afterEach(async () => {
        sinon.restore()
      })

      itIf(!protocol.lib.supportsHD, 'signWithPrivateKey - Is able to sign a transaction using a PrivateKey', async () => {
        const privateKey = await protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
        const txs: any[] = []

        for (const { unsignedTx } of protocol.txs) {
          const tx = await protocol.lib.signWithPrivateKey(privateKey, unsignedTx)
          txs.push(tx)
        }

        txs.forEach((tx, index) => {
          if (protocol.lib instanceof SubstrateProtocol) {
            const decoded = (protocol.lib as SubstrateProtocol).transactionController.decodeDetails(tx)[0]

            const signature = decoded.transaction.signature.signature.value
            const payload = Buffer.from(decoded.payload.encode(), 'hex')
            const publicKey = Buffer.from(protocol.wallet.publicKey, 'hex')

            expect(sr25519Verify(signature, payload, publicKey)).to.be.true
          } else {
            expect(tx).to.deep.equal(protocol.txs[index].signedTx)
          }
        })
      })

      itIf(protocol.lib.supportsHD, 'signWithExtendedPrivateKey - Is able to sign a transaction using a PrivateKey', async () => {
        const privateKey = await protocol.lib.getExtendedPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
        const txs: any[] = []

        for (const { unsignedTx } of protocol.txs) {
          const tx = await protocol.lib.signWithExtendedPrivateKey(privateKey, unsignedTx)
          txs.push(tx)
        }

        txs.forEach((tx, index) => {
          expect(tx).to.equal(protocol.txs[index].signedTx)
        })
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

          expect(airgapTx.protocolIdentifier, 'protocol-identifier does not match').to.equal(protocol.lib.identifier)

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
            airgapTx.to.map(obj => obj.toLowerCase()),
            'from'
          ).to.deep.equal(tx.to.map(obj => obj.toLowerCase()))
          expect(
            airgapTx.from.sort().map(obj => obj.toLowerCase()),
            'to'
          ).to.deep.equal(tx.from.sort().map(obj => obj.toLowerCase()))

          expect(airgapTx.amount).to.deep.equal(protocol.txs[0].amount)
          expect(airgapTx.fee).to.deep.equal(protocol.txs[0].fee)

          expect(airgapTx.protocolIdentifier).to.equal(protocol.lib.identifier)

          expect(airgapTx.transactionDetails, 'extras should exist').to.not.be.undefined
        }
      })

      it('should match all valid addresses', async () => {
        for (const address of protocol.validAddresses) {
          const match = address.match(protocol.lib.addressValidationPattern)

          expect(match && match.length > 0, `address: ${address}`).to.be.true
        }
      })
    })
  })

  // describe(`Sign Message`, () => {
  //   afterEach(async () => {
  //     sinon.restore()
  //   })

  //   itIf(protocol.messages, 'signMessage - Is able to sign a message using a PrivateKey', async () => {
  //     // const privateKey = protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)

  //     protocol.messages.forEach(async messageObject => {
  //       try {
  //         // const signature = await protocol.lib.signMessage(messageObject.message, privateKey)
  //         // TODO: Verify signature
  //         // expect(signature).to.equal(messageObject.signature)
  //       } catch (e) {
  //         expect(e).to.equal('Message signing not implemented')
  //       }
  //     })
  //   })

  //   itIf(protocol.messages, 'verifyMessage - Is able to verify a message using a PublicKey', async () => {
  //     // const privateKey = protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
  //     // const publicKey = protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
  //     // const publicKeyBuffer = Buffer.from(publicKey, 'hex')

  //     protocol.messages.forEach(async messageObject => {
  //       try {
  //         /*
  //         const signatureIsValid = await protocol.lib.verifyMessage(
  //           messageObject.message,
  //           Buffer.from(messageObject.signature) as any,
  //           publicKeyBuffer
  //         )
  //         */
  //         // TODO: Verify signature
  //         // expect(signatureIsValid).to.be.true
  //       } catch (e) {
  //         expect(e).to.equal('Message signing not implemented')
  //       }
  //     })
  //   })

  //   itIf(protocol.messages, 'signMessage and verifyMessage - Is able to sign and verify a message', async () => {
  //     const privateKey = protocol.lib.getPrivateKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
  //     const publicKey = protocol.lib.getPublicKeyFromMnemonic(protocol.mnemonic(), protocol.lib.standardDerivationPath)
  //     const publicKeyBuffer = Buffer.from(publicKey, 'hex')

  //     protocol.messages.forEach(async messageObject => {
  //       try {
  //         const signature = await protocol.lib.signMessage(messageObject.message, privateKey)
  //         const signatureIsValid = await protocol.lib.verifyMessage(messageObject.message, signature, publicKeyBuffer)

  //         expect(signatureIsValid).to.be.true

  //         const signature2IsValid = await protocol.lib.verifyMessage(
  //           `different-message-${messageObject.message}`,
  //           signature,
  //           publicKeyBuffer
  //         )
  //         expect(signature2IsValid).to.be.false
  //       } catch (e) {
  //         expect(e).to.equal('Message signing not implemented')
  //       }
  //     })
  //   })
  // })
})
