// tslint:disable: no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import { BitcoinProtocol } from '../../src/v0/protocol/BitcoinProtocol'
import { BitcoinSegwitProtocol } from '../../src/v0/protocol/BitcoinSegwitProtocol'
import { BitcoinTestnetProtocol } from '../../src/v0/protocol/BitcoinTestnetProtocol'

import { BitcoinProtocolSpec } from './specs/bitcoin'
import { BitcoinTestProtocolSpec } from './specs/bitcoin-test'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const VECTORS_PATH = join(__dirname, 'golden-vectors.json')

/**
 * Byte-level snapshot for the **v0** UTXO protocols, which are still backed by the vendored
 * `bitgo-utxo-lib` fork. Same purpose as the v1 snapshot: the migration off that fork must not
 * change a single derived key, address or signature, and "the tests still pass" is not evidence of
 * that on its own.
 *
 * v0 has a different protocol surface from v1 (mnemonic-based accessors rather than derivatives),
 * so this cannot share the v1 capture helper.
 *
 * Regenerate deliberately:
 *
 *     GOLDEN_UPDATE=1 npm test --workspace @airgap/bitcoin
 */
describe(`Golden vectors (v0 UTXO byte-level snapshot)`, () => {
  let captured: any

  before(async () => {
    const targets: { name: string; lib: any; spec: any; txs?: any[]; skipAddressFromPublicKey?: boolean }[] = [
      { name: 'bitcoin-v0', lib: new BitcoinProtocol(), spec: new BitcoinProtocolSpec() },
      { name: 'bitcoin-testnet-v0', lib: new BitcoinTestnetProtocol(), spec: new BitcoinTestProtocolSpec() },
      // Segwit has no v0 spec of its own; reuse the mainnet mnemonic. Its bip32 / bitcoinjs-lib /
      // ecc imports were all repointed by the migration, so its derivation must be pinned too.
      // Transaction signing goes through PSBTs and is not exercised by the P2PKH fixtures.
      // `getAddressFromPublicKey` is skipped: the v0 segwit implementation feeds the zpub it gets
      // from `getPublicKeyFromMnemonic` into `bip32.fromBase58` with the mainnet (xpub) version
      // bytes and throws `Invalid network version` — before the migration as well.
      {
        name: 'bitcoin-segwit-v0',
        lib: new BitcoinSegwitProtocol(),
        spec: new BitcoinProtocolSpec(),
        txs: [],
        skipAddressFromPublicKey: true
      }
    ]

    captured = {}

    for (const { name, lib, spec, txs: txsOverride, skipAddressFromPublicKey } of targets) {
      const txs: any[] = txsOverride ?? spec.txs
      const mnemonic: string = spec.mnemonic()
      const path: string = await lib.getStandardDerivationPath()

      const publicKey: string = await lib.getPublicKeyFromMnemonic(mnemonic, path)
      const privateKey: any = await lib.getPrivateKeyFromMnemonic(mnemonic, path)
      const extendedPublicKey: string = await lib.getExtendedPublicKeyFromMnemonic(mnemonic, path)
      const extendedPrivateKey: any = await lib.getExtendedPrivateKeyFromMnemonic(mnemonic, path)

      // `null` rather than `undefined` when skipped: JSON drops undefined keys, and the deep-equal
      // against the committed file would then fail on a key that exists only in memory.
      const addressFromPublicKey: any = skipAddressFromPublicKey ? null : await lib.getAddressFromPublicKey(publicKey)
      const addressFromExtendedPublicKey: string = await lib.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0)

      const derivedAddresses: string[] = []
      for (const [visibility, index] of [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 3]
      ]) {
        derivedAddresses.push(await lib.getAddressFromExtendedPublicKey(extendedPublicKey, visibility, index))
      }

      const signedTransactions: string[] = []
      for (const { unsignedTx } of txs) {
        signedTransactions.push(await lib.signWithExtendedPrivateKey(extendedPrivateKey, unsignedTx))
      }

      // `signWithPrivateKey` was rewritten by the migration (it used to throw unconditionally). A
      // non-extended key can only spend inputs at its own address and cannot verify change, so sign
      // the fixture transactions with the change outputs dropped and every input owned by the
      // account key.
      const signedWithPrivateKey: string[] = []
      if (typeof privateKey === 'string' && txs.length > 0) {
        const accountAddress: string = addressFromPublicKey.address
        for (const { unsignedTx } of txs) {
          const singleKeyTx = {
            ...unsignedTx,
            ins: unsignedTx.ins.map((input: any) => ({ ...input, address: accountAddress, derivationPath: undefined })),
            outs: unsignedTx.outs.filter((output: any) => !output.isChange)
          }
          signedWithPrivateKey.push(await lib.signWithPrivateKey(privateKey, singleKeyTx))
        }
      }

      captured[name] = {
        publicKey,
        privateKey: Buffer.isBuffer(privateKey) ? privateKey.toString('hex') : String(privateKey),
        extendedPublicKey,
        extendedPrivateKey: Buffer.isBuffer(extendedPrivateKey) ? extendedPrivateKey.toString('hex') : String(extendedPrivateKey),
        addressFromPublicKey,
        addressFromExtendedPublicKey,
        derivedAddresses,
        signedTransactions,
        signedWithPrivateKey
      }
    }
  })

  it('should match the committed snapshot', async () => {
    if (process.env.GOLDEN_UPDATE === '1') {
      writeFileSync(VECTORS_PATH, `${JSON.stringify(captured, undefined, 2)}\n`)
      // eslint-disable-next-line no-console
      console.log(`v0 golden vectors rewritten: ${VECTORS_PATH}`)

      return
    }

    expect(existsSync(VECTORS_PATH), `missing ${VECTORS_PATH} — run with GOLDEN_UPDATE=1 to create it`).to.be.true

    const committed: any = JSON.parse(readFileSync(VECTORS_PATH, 'utf-8'))

    for (const name of Object.keys(committed)) {
      expect(captured[name], `protocol "${name}" is in the snapshot but was not captured`).to.not.be.undefined
      expect(captured[name], `v0 golden vectors changed for "${name}"`).to.deep.equal(committed[name])
    }

    expect(Object.keys(captured).sort()).to.deep.equal(Object.keys(committed).sort())
  })
})
