const BIP39 = require('../../../dist/core/dependencies/src/bip39-2.5.0/index')
const assert = require('assert')
const networks = require('../../../dist/core/networks')

const bitcoinJS = require('../../../dist/core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index')

const BigNumber = require('../../../dist/core/dependencies/src/bignumber.js-9.0.0/bignumber')

const mnemonicPhrase = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const masterSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

const CoinLib = require('../../../dist/core/index')

const validateTxHelper = require('./helpers/validate-tx')

const sinon = require('sinon')
const axios = require('../../../dist/core/dependencies/src/axios-0.19.0/index')

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
        assert.equal(results[0], '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
        assert.equal(results[1], '15srTWTrucPWSUGFZY2LWaYobwpDLknz49') // m/44'/0'/0'/0/0
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
  // it('should return the correct litecoin address from extended public key', function(done) {
  //   const litecoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.litecoin)
  //   const extendedPublicKey = litecoinHdNode
  //     .derivePath("m/44'/2'/0'")
  //     .neutered()
  //     .toBase58()
  //   const litecoin = new CoinLib.LitecoinProtocol()

  //   Promise.all([
  //     litecoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0),
  //     litecoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1)
  //   ])
  //     .then(results => {
  //       assert.equal(results[0], 'LaKxMHETSaWsigMYs88J6ibEGZnLRNWWH1') // m/44'/2'/0'/0/0
  //       assert.equal(results[1], 'LQUaS2G2FGB2fnoNmon6ERv94JAk6GR29R') /// m/44'/2'/0'/0/1
  //       done()
  //     })
  //     .catch(error => {
  //       done(error)
  //     })
  // })
  it('should return the correct bitcointestnet address from extended public key', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPublicKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'").neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()

    Promise.all([
      bitcointestnet.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0),
      bitcointestnet.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1)
    ])
      .then((results) => {
        assert.equal(results[0], 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k') // m/44'/1'/0'/0/0
        assert.equal(results[1], 'moK2Ws7YvK3LRppzCuLRVfDkpvZiw7T4cu') // m/44'/1'/0'/0/1
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
  it('should return the correct ethereum address from extended public key', function (done) {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const publicKey = bitcoinHdNode.derivePath("m/44'/60'/0'").neutered().toBase58()
    const eth = new CoinLib.EthereumProtocol()

    eth
      .getAddressFromExtendedPublicKey(publicKey, 0, 0)
      .then((address) => {
        assert.equal(address, '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
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
        assert.equal(address, '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
  // it('should return the correct litecoin address from public key', function (done) {
  //   const litecoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.litecoin)
  //   const publicKey = litecoinHdNode.derivePath("m/44'/2'/0'/0/0").neutered().toBase58()
  //   const litecoin = new CoinLib.LitecoinProtocol()
  //   litecoin
  //     .getAddressFromPublicKey(publicKey)
  //     .then((address) => {
  //       assert.equal(address, 'LaKxMHETSaWsigMYs88J6ibEGZnLRNWWH1')
  //       done()
  //     })
  //     .catch((error) => {
  //       done(error)
  //     })
  // })
  it('should return the correct bitcointestnet address from extended public key', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const publicKey = bitcoinTestnetHdNode.derivePath("m/44'/1'/0'/0/0").neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()
    bitcointestnet
      .getAddressFromPublicKey(publicKey)
      .then((address) => {
        assert.equal(address, 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
  it('should return the correct ethereum address from extended public key', function (done) {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = bitcoinHdNode.derivePath("m/44'/60'/0'/0/0").neutered().getPublicKeyBuffer()
    const eth = new CoinLib.EthereumProtocol()

    eth
      .getAddressFromPublicKey(publicKey)
      .then((address) => {
        assert.equal(address, '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
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
  /*
 TODO: Commented out because the testnet API is down
  it('should return the correct ethereum ropsten balance', function(done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode
      .derivePath("m/44'/60'/0'/0/0")
      .neutered()
      .getPublicKeyBuffer()
    const ropstenEthereum = new CoinLib.EthereumRopstenProtocol()
    ropstenEthereum
      .getBalanceOfPublicKey(publicKey)
      .then(value => {
        assert.equal(value.toString(10), '997716589253989015')
        done()
      })
      .catch(done)
  })
*/
  /*
  @deprecated: flaky test that fails given the address balance changes, done in new set of tests anyway
  it('should return the correct ethereum balance given an address', function(done) {
    const address = '0x2B6eD29A95753C3Ad948348e3e7b1A251080Ffb9'
    const ethereum = new CoinLib.EthereumProtocol()
    ethereum
      .getBalanceOfAddresses([address])
      .then(value => {
        assert.equal(value.toString(10), '250000000010000000000000')
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
  /*
 TODO: Commented out because the testnet API is down
  it('should return a correct ethereum ropsten transaction', function(done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode
      .derivePath("m/44'/60'/0'/0/0")
      .neutered()
      .getPublicKeyBuffer()
    const privateKey = ethereumRopstenNode.derivePath("m/44'/60'/0'/0/0").keyPair.d.toBuffer(32)
    const ethereumRopstenProtocol = new CoinLib.EthereumRopstenProtocol()
    ethereumRopstenProtocol
      .prepareTransactionFromPublicKey(
        publicKey,
        ['0x41d9c9996Ca6De4B759deC24B09EF638c94166e8'],
        [new BigNumber(10)],
        new BigNumber(21000 * 10 ** 9)
      )
      .then(transaction => {
        ethereumRopstenProtocol.signWithPrivateKey(privateKey, transaction).then(rawTransaction => {
          done()
        })
      })
      .catch(done)
  })
*/
})

describe('Secret to Public Key Logic', function () {
  it('should return the correct ethereum public key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/60'/0'/0/0'`
    const publicKey = '0x03529b67e7631415fe420b7dc4ef7da2e3d3794ebd12d0ec26e756106f24bc05f4'

    const publicKeyBuffer = await new CoinLib.EthereumProtocol().getPublicKeyFromMnemonic(mnemonicPhrase, derivationPath)
    assert.equal('0x' + publicKeyBuffer.toString('hex'), publicKey)
  })

  it('should return the correct bitcoin extended public key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/0'/0'`
    const publicKey = 'xpub6BhAi6AdpiSy91gRMSkgHARUukwbt4tQxGR3uf6La7Gtzw1zRmjkeVtA7a7EGHBR11uiQUtTJHbAsLQvnSDDn652j8aDwuWceJkZqphSvnX'

    const bitcoin = new CoinLib.BitcoinProtocol()
    const result = await bitcoin.getPublicKeyFromMnemonic(mnemonicPhrase, derivationPath)

    assert.equal(result, publicKey)
    assert.equal(await bitcoin.getAddressFromExtendedPublicKey(result, 0, 0), '1DC2NBm8L3QoFhRL9dkrFxFLJjkH2GG9HL')
  })
})

describe('Secret to Private Key Logic', function () {
  it('should return the correct ethereum private key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/60'/0'/0/0`
    const privateKey = '0x0134c240a31c801e65ece657bb695e232de25232b82ff29238d344309ec6af29'

    const privateKeyBuffer = await new CoinLib.EthereumProtocol().getPrivateKeyFromMnemonic(mnemonicPhrase, derivationPath)
    assert.equal('0x' + privateKeyBuffer.toString('hex'), privateKey)
  })

  it('should return the correct bitcoin extended private key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/0'/0'`
    const privateKey = 'xprv9xhpJadjzLtfvXbxFRDfv2UkMj77UcAZb3VT7Ggj1mjv88gqtERW6hZgGGwAWaqdUZ26s6UPcUugMpjSTWm1gay1KkqQxtBf45fLyAHn7bX'

    const bitcoin = new CoinLib.BitcoinProtocol()
    const result = await bitcoin.getExtendedPrivateKeyFromMnemonic(mnemonicPhrase, derivationPath)

    assert.equal(result, privateKey)
    assert.equal(await bitcoin.getAddressFromExtendedPublicKey(result, 0, 0), '1DC2NBm8L3QoFhRL9dkrFxFLJjkH2GG9HL')
  })
})

describe('List Transactions', function () {
  /*
  TODO: commented out because api.trustwallet.com is unreliable
  it('should return the correct ethereum transactions given an address', function(done) {
    const address = '0x281055Afc982d96fAB65b3a49cAc8b878184Cb16'
    const ethereum = new CoinLib.EthereumProtocol()

    ethereum
      .getTransactionsFromAddresses([address], 20, 0)
      .then(transactions => {
        validateTxHelper(transactions[0])
        done()
      })
      .catch(done)
  })
  */
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
  /*
  it('should return the correct ethereum ropsten transactions', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode
      .derivePath("m/44'/60'/0'/0/0")
      .neutered()
      .getPublicKeyBuffer()
    const ethereumRopsten = new CoinLib.EthereumRopstenProtocol()

    ethereumRopsten.getAddressFromPublicKey(publicKey).then(address => {
      sinon
        .stub(axios, 'get')
        .withArgs(`https://ropsten.trustwalletapp.com/transactions?address=${address}&page=1&limit=20&filterContractInteraction=true`)
        .returns(Promise.resolve({ data: { docs: [] } }))

      ethereumRopsten
        .getTransactionsFromPublicKey(publicKey, 20, 0)
        .then(transactions => {
          sinon.restore()
          done()
        })
        .catch(error => {
          sinon.restore()
          done(error)
        })
    })
  })

  */
})
describe('Transaction Detail Logic', function (done) {
  it('should correctly give details to an ethereum tx', function (done) {
    const tx = {
      nonce: '0x00',
      gasPrice: '0x04a817c800',
      gasLimit: '0x5208',
      to: '0xf5E54317822EBA2568236EFa7b08065eF15C5d42',
      value: '0x0de0b6b3a7640000',
      data: '0x',
      chainId: 1
    }
    const ethereum = new CoinLib.EthereumProtocol()

    ethereum
      .getTransactionDetails({
        publicKey: '02e3188bc0c05ccfd6938cb3f5474a70927b5580ffb2ca5ac425ed6a9b2a9e9932',
        transaction: tx
      })
      .then(([airGapTx]) => {
        assert.deepEqual(airGapTx.from, ['0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e'], 'from-addresses were not properly extracted')
        assert.deepEqual(airGapTx.to, ['0xf5E54317822EBA2568236EFa7b08065eF15C5d42'], 'to-addresses were not properly extracted')
        assert.equal(airGapTx.fee, '420000000000000', 'fee was not properly extracted')
        assert.equal(airGapTx.amount, '1000000000000000000', 'amount was not properly extracted')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })

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
