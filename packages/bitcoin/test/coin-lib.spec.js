const BIP39 = require('@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index')
const assert = require('assert')

const bitcoinJS = require('@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index')

const mnemonicPhrase = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const masterSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

const CoinLib = require('../dist/index')

describe('Extended Public Derivation Logic', function () {
  it('should return the correct bitcoin address from extended public key', function (done) {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const extendedPublicKey = bitcoinHdNode.derivePath("m/44'/0'/0'").neutered().toBase58()
    // if you call "neutered" it will make sure only the extended public is being used
    // the actual derivation path of the first address is "m/44'/0'/0'/0/0" (it's not hardened (') because hardened keys cannot be derived from public information)
    const bitcoin = new CoinLib.BitcoinProtocol()

    Promise.all([
      bitcoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0),
      bitcoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1)
    ])
      .then((results) => {
        assert.equal(results[0].address, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
        assert.equal(results[1].address, '15srTWTrucPWSUGFZY2LWaYobwpDLknz49') // m/44'/0'/0'/0/0
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
  it('should return the correct bitcointestnet address from extended public key', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPublicKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'").neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()

    Promise.all([
      bitcointestnet.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0),
      bitcointestnet.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1)
    ])
      .then((results) => {
        assert.equal(results[0].address, 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k') // m/44'/1'/0'/0/0
        assert.equal(results[1].address, 'moK2Ws7YvK3LRppzCuLRVfDkpvZiw7T4cu') // m/44'/1'/0'/0/1
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
})

describe('Public Derivation Logic', function () {
  it('should return the correct bitcoin address from public key', function (done) {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const publicKey = bitcoinHdNode.derivePath("m/44'/0'/0'/0/0").neutered().toBase58()
    const bitcoin = new CoinLib.BitcoinProtocol()
    bitcoin
      .getAddressFromPublicKey(publicKey)
      .then((address) => {
        assert.equal(address.address, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
  it('should return the correct bitcointestnet address from extended public key', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const publicKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'/0/0").neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()
    bitcointestnet
      .getAddressFromPublicKey(publicKey)
      .then((address) => {
        assert.equal(address.address, 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
})

describe('Balance Of', function () {
  /*
  TODO: Commented out because the testnet API is down
  it('should return the correct bitcointestnet balance', function(done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPrivateKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'").toBase58()
    const extendedPublicKey = bitcoinTestnetHdNode
      .derivePath("m/44'/1'/0'")
      .neutered()
      .toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()

    bitcointestnet
      .getBalanceOfExtendedPublicKey(extendedPublicKey, 0)
      .then(value => {
        assert.equal(value.toString(10), '65000010')
        done()
      })
      .catch(done)
  })
  */
  // it('should return the correct bitcoin balance given an address', function (done) {
  //   const address = '122zHqVVaY21SEjSPeHqVVs9qFDwTV3duS'
  //   const bitcoin = new CoinLib.BitcoinProtocol()
  //   sinon
  //     .stub(axios, 'get')
  //     .withArgs(
  //       `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://btc1.trezor.io/api/v2/utxo/xpub6CzH93BB4aueZX2bP88tvsvE8Cz2bHeGVAZSD5fmnk8roYBZCGbwwSA7ChiRr65jncuPH8qBQA9nBwi2Qtz1Uqt8wuHvof9SAcPpFxpe1GV?confirmed=true`
  //     )
  //     .returns(
  //       Promise.resolve({
  //         data: [
  //           {
  //             txid: '8a10220812842e93b7263491cf664b36fece9861b39ca762b57ac46bb7a7cd7b',
  //             vout: 0,
  //             value: '10',
  //             height: 1353085,
  //             confirmations: 132951,
  //             address: '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi',
  //             path: "m/44'/0'/0'/0/0"
  //           },
  //           {
  //             txid: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
  //             vout: 0,
  //             value: '32418989',
  //             height: 1296906,
  //             confirmations: 189130,
  //             address: '1QKqr9wjki9K9tF9NxigbwgHeLXHT682sc',
  //             path: "m/44'/0'/0'/1/2"
  //           }
  //         ]
  //       })
  //     )
  //   bitcoin
  //     .getBalanceOfAddresses([address])
  //     .then((value) => {
  //       assert.equal(value.toString(10), '32418999')
  //       sinon.restore()
  //       done()
  //     })
  //     .catch(done)
  // })
})

describe('Raw Transaction Prepare', function () {
  /*
  TODO: Commented out because the testnet API is down
  it('should return a correct bitcointestnet transaction', function(done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPrivateKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'").toBase58()
    const extendedPublicKey = bitcoinTestnetHdNode
      .derivePath("m/44'/1'/0'")
      .neutered()
      .toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()
    bitcointestnet
      .prepareTransactionFromExtendedPublicKey(
        extendedPublicKey,
        0,
        ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'],
        [new BigNumber(10)],
        new BigNumber(27000)
      )
      .then(transaction => {
        bitcointestnet.signWithExtendedPrivateKey(extendedPrivateKey, transaction).then(rawTransaction => {
          done()
        })
      })
      .catch(done)
  })
  */
})

describe('Secret to Public Key Logic', function () {
  it('should return the correct bitcoin extended public key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/0'/0'`
    const publicKey = 'xpub6BhAi6AdpiSy91gRMSkgHARUukwbt4tQxGR3uf6La7Gtzw1zRmjkeVtA7a7EGHBR11uiQUtTJHbAsLQvnSDDn652j8aDwuWceJkZqphSvnX'

    const bitcoin = new CoinLib.BitcoinProtocol()
    const result = await bitcoin.getPublicKeyFromMnemonic(mnemonicPhrase, derivationPath)
    const address = await bitcoin.getAddressFromExtendedPublicKey(result, 0, 0)

    assert.equal(result, publicKey)
    assert.equal(address.address, '1DC2NBm8L3QoFhRL9dkrFxFLJjkH2GG9HL')
  })
})

describe('Secret to Private Key Logic', function () {
  it('should return the correct bitcoin extended private key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/0'/0'`
    const privateKey = 'xprv9xhpJadjzLtfvXbxFRDfv2UkMj77UcAZb3VT7Ggj1mjv88gqtERW6hZgGGwAWaqdUZ26s6UPcUugMpjSTWm1gay1KkqQxtBf45fLyAHn7bX'

    const bitcoin = new CoinLib.BitcoinProtocol()
    const result = await bitcoin.getExtendedPrivateKeyFromMnemonic(mnemonicPhrase, derivationPath)
    const address = await bitcoin.getAddressFromExtendedPublicKey(result, 0, 0)

    assert.equal(result, privateKey)
    assert.equal(address.address, '1DC2NBm8L3QoFhRL9dkrFxFLJjkH2GG9HL')
  })
})

describe('List Transactions', function () {
  // it('should return the correct bitcoin transactions given an address', function (done) {
  //   const address = '1N2KZxQwK7Scnvf7bJ7yigYRopJMjFQ4B2'
  //   const bitcoin = new CoinLib.BitcoinProtocol()
  //   bitcoin
  //     .getTransactionsFromAddresses([address], 20, 0)
  //     .then((transactionResult) => {
  //       validateTxHelper(transactionResult.transactions[0])
  //       done()
  //     })
  //     .catch(done)
  // })
  // it('should return the correct bitcoin transactions given a live address', function (done) {
  //   const bitcoin = new CoinLib.BitcoinProtocol()
  //   bitcoin
  //     .getTransactionsFromAddresses(['14KJNpguYfoeZEaqbmqL2qjrCADerHTNKr'], 20, 0)
  //     .then((transactionResult) => {
  //       validateTxHelper(transactionResult.transactions[0])
  //       done()
  //     })
  //     .catch(done)
  // })
  /*
  TODO: Commented out because the testnet API is down
  it('should return the correct bitcointestnet transactions', function(done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPrivateKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'").toBase58()
    const extendedPublicKey = bitcoinTestnetHdNode
      .derivePath("m/44'/1'/0'")
      .neutered()
      .toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()

    bitcointestnet
      .getTransactionsFromExtendedPublicKey(extendedPublicKey, 20, 0)
      .then(transactions => {
        validateTxHelper(transactions[0])
        done()
      })
      .catch(done)
  })
  */
})
describe('Transaction Detail Logic', function (done) {
  it('should correctly give details to a bitcoin tx', function (done) {
    const tx = {
      ins: [
        {
          txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
          value: 10,
          vout: 0,
          address: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
          derivationPath: '0/0'
        },
        {
          txId: 'cc69b832b6d922a04bf9653bbd12335a78f82fc09be7536f2378bbad8554039d',
          value: 32418989,
          vout: 1,
          address: 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX',
          derivationPath: '1/3'
        }
      ],
      outs: [
        {
          recipient: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
          isChange: false,
          value: 10
        },
        {
          recipient: 'miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq',
          isChange: true,
          value: 32391989
        }
      ]
    }

    const bitcoin = new CoinLib.BitcoinProtocol()

    bitcoin
      .getTransactionDetails({
        transaction: tx
      })
      .then(([airGapTx]) => {
        assert.deepEqual(
          airGapTx.from,
          ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k', 'mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX'],
          'from-addresses were not properly extracted'
        )
        assert.deepEqual(airGapTx.to, ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'], 'to-addresses were not properly extracted')
        assert.equal(airGapTx.fee, '27000', 'fee was not properly extracted')
        assert.equal(airGapTx.amount, '10', 'amount was not properly extracted')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
})
