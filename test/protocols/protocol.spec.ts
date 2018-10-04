import { expect } from 'chai'
import 'mocha'
import { protocols, seed, TestProtocolSpec } from './implementations'
import BigNumber from 'bignumber.js'

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

    describe(`Create Transaction`, () => {
      it('prepareTransactionFromPublicKey - Is able to prepare a transaction using its public key', async function() {
        let tx = await protocol.lib.prepareTransactionFromPublicKey(
          protocol.wallet.publicKey,
          [protocol.wallet.address],
          [new BigNumber(10)],
          new BigNumber(10)
        )
        expect(tx).to.equal(protocol.txs[0].unsignedTx)
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
  })
})
