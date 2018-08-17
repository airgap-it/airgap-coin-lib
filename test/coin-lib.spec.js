const BIP39 = require('bip39')
const assert = require('assert')
const networks = require('../dist/networks')

const bitcoinJS = require('bitcoinjs-lib')
const zcashJS = require('bitcoinjs-lib-zcash')

const BigNumber = require('bignumber.js')

const mnemonicPhrase = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const masterSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

const CoinLib = require('../dist/index')

const validateTxHelper = require('./helpers/validate-tx')

describe('Extended Public Derivation Logic', function () {
  it('should return the correct bitcoin address from extended public key', function () {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const extendedPublicKey = bitcoinHdNode.derivePath('m/44\'/0\'/0\'').neutered().toBase58()
    // if you call "neutered" it will make sure only the extended public is being used
    // the actual derivation path of the first address is "m/44'/0'/0'/0/0" (it's not hardened (') because hardened keys cannot be derived from public information)
    const bitcoin = new CoinLib.BitcoinProtocol()
    assert.equal(bitcoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0), '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
    // m/44'/0'/0'/0/0
    assert.equal(bitcoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1), '15srTWTrucPWSUGFZY2LWaYobwpDLknz49')
  })
  it('should return the correct litecoin address from extended public key', function () {
    const litecoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.litecoin)
    const extendedPublicKey = litecoinHdNode.derivePath('m/44\'/2\'/0\'').neutered().toBase58()
    const litecoin = new CoinLib.LitecoinProtocol()
    // m/44'/2'/0'/0/0
    assert.equal(litecoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0), 'LaKxMHETSaWsigMYs88J6ibEGZnLRNWWH1')
    // m/44'/2'/0'/0/1
    assert.equal(litecoin.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1), 'LQUaS2G2FGB2fnoNmon6ERv94JAk6GR29R')
  })
  it('should return the correct bitcointestnet address from extended public key', function () {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPublicKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()
    // m/44'/1'/0'/0/0
    assert.equal(bitcointestnet.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0), 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k')
    // m/44'/1'/0'/0/1
    assert.equal(bitcointestnet.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1), 'moK2Ws7YvK3LRppzCuLRVfDkpvZiw7T4cu')
  })
  it('should return the correct zcash address from extended public key', function () {
    const zcashHdNode = zcashJS.HDNode.fromSeedBuffer(masterSeed, networks.zcash)
    const extendedPublicKey = zcashHdNode.derivePath('m/44\'/133\'/0\'').neutered().toBase58()
    const zcash = new CoinLib.ZCashProtocol()
    // m/44'/133'/0'/0/0
    assert.equal(zcash.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 0), 't1PFyZ43MRrVRBWTKqTT5wfimtZ9MFSTgPC')
    // m/44'/133'/0'/0/1
    assert.equal(zcash.getAddressFromExtendedPublicKey(extendedPublicKey, 0, 1), 't1XwXnCQopt16zfAJVb76A7JPerKE9LSg9L')
  })
  it('should return the correct ethereum address from extended public key', function () {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const publicKey = bitcoinHdNode.derivePath('m/44\'/60\'/0\'').neutered().toBase58()
    const eth = new CoinLib.EthereumProtocol()
    assert.equal(eth.getAddressFromExtendedPublicKey(publicKey, 0, 0), '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })
})

describe('Public Derivation Logic', function () {
  it('should return the correct bitcoin address from public key', function () {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const publicKey = bitcoinHdNode.derivePath('m/44\'/0\'/0\'/0/0').neutered().toBase58()
    const bitcoin = new CoinLib.BitcoinProtocol()
    assert.equal(bitcoin.getAddressFromPublicKey(publicKey), '15B2gX2x1eqFKgR44nCe1i33ursGKP4Qpi')
  })
  it('should return the correct litecoin address from public key', function () {
    const litecoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.litecoin)
    const publicKey = litecoinHdNode.derivePath('m/44\'/2\'/0\'/0/0').neutered().toBase58()
    const litecoin = new CoinLib.LitecoinProtocol()
    assert.equal(litecoin.getAddressFromPublicKey(publicKey), 'LaKxMHETSaWsigMYs88J6ibEGZnLRNWWH1')
  })
  it('should return the correct bitcointestnet address from extended public key', function () {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const publicKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'/0/0').neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()
    assert.equal(bitcointestnet.getAddressFromPublicKey(publicKey), 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k')
  })
  it('should return the correct zcash address from extended public key', function () {
    const zcashHdNode = zcashJS.HDNode.fromSeedBuffer(masterSeed, networks.zcash)
    const publicKey = zcashHdNode.derivePath('m/44\'/133\'/0\'/0/0').neutered().toBase58()
    const zcash = new CoinLib.ZCashProtocol()
    assert.equal(zcash.getAddressFromPublicKey(publicKey), 't1PFyZ43MRrVRBWTKqTT5wfimtZ9MFSTgPC')
  })
  it('should return the correct ethereum address from extended public key', function () {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = bitcoinHdNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const eth = new CoinLib.EthereumProtocol()
    assert.equal(eth.getAddressFromPublicKey(publicKey), '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
  })
})

describe('Balance Of', function () {
  it('should return the correct bitcointestnet balance', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPrivateKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').toBase58()
    const extendedPublicKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()

    bitcointestnet.getBalanceOfExtendedPublicKey(extendedPublicKey, 0).then(value => {
      assert.equal(value.toString(10), '65000010')
      done()
    }).catch(done)
  })

  it('should return the correct ethereum ropsten balance', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const ropstenEthereum = new CoinLib.EthereumRopstenProtocol()
    ropstenEthereum.getBalanceOfPublicKey(publicKey).then(value => {
      assert.equal(value.toString(10), '997716589253989015')
      done()
    }).catch(done)
  })

  it('should return the correct hop ropsten balance', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const hopRopsten = new CoinLib.HOPTokenProtocol()
    hopRopsten.getBalanceOfPublicKey(publicKey).then(value => {
      assert.equal(value.toString(10), '11999999999999999420')
      done()
    }).catch(done)
  })

  it('should return the correct ethereum balance given an address', function (done) {
      const address = '0x5ffc99b5b23c5ab8f463f6090342879c286a29be'
      const ethereum = new CoinLib.EthereumProtocol()
      ethereum.getBalanceOfAddresses([address]).then(value => {
          assert.equal(value.toString(10), '552124155366522618683042')
          done()
      }).catch(done)
  })

  it('should return the correct bitcoin balance given an address', function (done) {
      const address = '122zHqVVaY21SEjSPeHqVVs9qFDwTV3duS'
      const bitcoin = new CoinLib.BitcoinProtocol()
      bitcoin.getBalanceOfAddresses([address]).then(value => {
          assert.equal(value.toString(10), '545454689954')
          done()
      }).catch(done)
  })

  it('should return the correct ae balance given an address', function (done) {
    const address = '0x73494bcb0865a72fd03cb3242e4c7b48688c0feb'
    const aeToken = new CoinLib.AETokenProtocol()
    aeToken.getBalanceOfAddresses([address]).then(value => {
      assert.equal(value.toString(10), '1000000000000000000')
      done()
    }).catch(done)
  })
})

describe('Raw Transaction Prepare', function () {
  it('should return a correct bitcointestnet transaction', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPrivateKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').toBase58()
    const extendedPublicKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()
    console.log(extendedPublicKey.toString('hex'))
    bitcointestnet.prepareTransactionFromExtendedPublicKey(extendedPublicKey, 0, ['mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k'], [new BigNumber(10)], new BigNumber(27000)).then(transaction => {
      bitcointestnet.signWithExtendedPrivateKey(extendedPrivateKey, transaction).then(rawTransaction => {
        done()
      })
    }).catch(done)
  })

  it('should return a correct ethereum ropsten transaction', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const privateKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').keyPair.d.toBuffer(32)
    const ethereumRopstenProtocol = new CoinLib.EthereumRopstenProtocol()
    ethereumRopstenProtocol.prepareTransactionFromPublicKey(publicKey, ['0x41d9c9996Ca6De4B759deC24B09EF638c94166e8'], [new BigNumber(10)], new BigNumber(21000 * 10 ** 9)).then(transaction => {
      ethereumRopstenProtocol.signWithPrivateKey(privateKey, transaction).then(rawTransaction => {
        done()
      })
    }).catch(done)
  })

  it('should return a correct hop ropsten transaction', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const privateKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').keyPair.d.toBuffer(32)
    const hopTokenProtocol = new CoinLib.HOPTokenProtocol()
    hopTokenProtocol.prepareTransactionFromPublicKey(publicKey, ['0x41d9c9996Ca6De4B759deC24B09EF638c94166e8'], [new BigNumber(10)], new BigNumber(21000 * 10 ** 9)).then(transaction => {
      hopTokenProtocol.signWithPrivateKey(privateKey, transaction).then(rawTransaction => {
        done()
      })
    }).catch(done)
  })
})

describe('Secret to Public Key Logic', function () {
  it('should return the correct ethereum public key for a given secret', function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/60'/0'/0/0'`
    const publicKey = '0x03529b67e7631415fe420b7dc4ef7da2e3d3794ebd12d0ec26e756106f24bc05f4'

    const hexSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

    const publicKeyBuffer = new CoinLib.EthereumProtocol().getPublicKeyFromHexSecret(hexSeed, derivationPath)
    assert.equal('0x' + publicKeyBuffer.toString('hex'), publicKey)
  })

  it('should return the correct bitcoin extended public key for a given secret', function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/0'/0'`
    const publicKey = 'xpub6BhAi6AdpiSy91gRMSkgHARUukwbt4tQxGR3uf6La7Gtzw1zRmjkeVtA7a7EGHBR11uiQUtTJHbAsLQvnSDDn652j8aDwuWceJkZqphSvnX'

    const hexSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

    const bitcoin = new CoinLib.BitcoinProtocol()
    const result = bitcoin.getPublicKeyFromHexSecret(hexSeed, derivationPath)

    assert.equal(result, publicKey)
    assert.equal(bitcoin.getAddressFromExtendedPublicKey(result, 0, 0), '1DC2NBm8L3QoFhRL9dkrFxFLJjkH2GG9HL')
  })
})

describe('Secret to Private Key Logic', function () {
  it('should return the correct ethereum private key for a given secret', function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/60'/0'/0/0`
    const privateKey = '0x0134c240a31c801e65ece657bb695e232de25232b82ff29238d344309ec6af29'

    const hexSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

    const privateKeyBuffer = new CoinLib.EthereumProtocol().getPrivateKeyFromHexSecret(hexSeed, derivationPath)
    assert.equal('0x' + privateKeyBuffer.toString('hex'), privateKey)
  })

  it('should return the correct bitcoin extended private key for a given secret', function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/0'/0'`
    const privateKey = 'xprv9xhpJadjzLtfvXbxFRDfv2UkMj77UcAZb3VT7Ggj1mjv88gqtERW6hZgGGwAWaqdUZ26s6UPcUugMpjSTWm1gay1KkqQxtBf45fLyAHn7bX'

    const hexSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

    const bitcoin = new CoinLib.BitcoinProtocol()
    const result = bitcoin.getExtendedPrivateKeyFromHexSecret(hexSeed, derivationPath)

    assert.equal(result, privateKey)
    assert.equal(bitcoin.getAddressFromExtendedPublicKey(result, 0, 0), '1DC2NBm8L3QoFhRL9dkrFxFLJjkH2GG9HL')
  })
})

describe('List Transactions', function () {
  it('should return the correct ethereum transactions given an address', function (done) {
      const address = '0x281055Afc982d96fAB65b3a49cAc8b878184Cb16'
      const ethereum = new CoinLib.EthereumProtocol()

      ethereum.getTransactionsFromAddresses([address], 20, 0).then(transactions => {
          validateTxHelper(transactions[0])
          done()
      }).catch(done)
  })

  it('should return the correct bitcoin transactions given an address', function (done) {
      const address = '1N2KZxQwK7Scnvf7bJ7yigYRopJMjFQ4B2'
      const bitcoin = new CoinLib.BitcoinProtocol()

      bitcoin.getTransactionsFromAddresses([address], 20, 0).then(transactions => {
          validateTxHelper(transactions[0])
          done()
      }).catch(done)
  })

  it('should return the correct bitcoin transactions given an live address', function (done) {
    const bitcoin = new CoinLib.BitcoinProtocol()

    bitcoin.getTransactionsFromAddresses(['14KJNpguYfoeZEaqbmqL2qjrCADerHTNKr'], 20, 0).then(transactions => {
        validateTxHelper(transactions[0])
        done()
    }).catch(done)
})

  it('should return the correct bitcointestnet transactions', function (done) {
    const bitcoinTestnetHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.testnet)
    const extendedPrivateKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').toBase58()
    const extendedPublicKey = bitcoinTestnetHdNode.derivePath('m/44\'/1\'/0\'').neutered().toBase58()
    const bitcointestnet = new CoinLib.BitcoinTestnetProtocol()

    bitcointestnet.getTransactionsFromExtendedPublicKey(extendedPublicKey, 20, 0).then(transactions => {
      validateTxHelper(transactions[0])
      done()
    }).catch(done)
  })

  it('should return the correct ethereum ropsten transactions', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const ethereumRopsten = new CoinLib.EthereumRopstenProtocol()

    ethereumRopsten.getTransactionsFromPublicKey(publicKey, 20, 0).then(transactions => {
      validateTxHelper(transactions[0])
      done()
    }).catch(done)
  })

  it('should return the correct hops erc 20 transactions', function (done) {
    const ethereumRopstenNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = ethereumRopstenNode.derivePath('m/44\'/60\'/0\'/0/0').neutered().getPublicKeyBuffer()
    const hopToken = new CoinLib.HOPTokenProtocol()

    hopToken.getTransactionsFromPublicKey(publicKey, 20, 0).then(transactions => {
      validateTxHelper(transactions[0])
      done()
    }).catch(done)
  })


})

describe('Transaction Detail Logic', function () {
  it('should correctly give details to an ethereum tx', function () {
    const tx = { "from": "0x7461531f581A662C5dF140FD6eA1317641fFcad2", "nonce": "0x00", "gasPrice": "0x04a817c800", "gasLimit": "0x5208", "to": "0xf5E54317822EBA2568236EFa7b08065eF15C5d42", "value": "0x0de0b6b3a7640000", "data": "0x", "chainId": 1 }
    const ethereum = new CoinLib.EthereumProtocol()

    const airGapTx = ethereum.getTransactionDetails(tx)

    assert.deepEqual(airGapTx.from, ["0x7461531f581A662C5dF140FD6eA1317641fFcad2"], "from-addresses were not properly extracted")
    assert.deepEqual(airGapTx.to, ["0xf5E54317822EBA2568236EFa7b08065eF15C5d42"], "to-addresses were not properly extracted")
    assert.equal(airGapTx.fee, "420000000000000", "fee was not properly extracted")
    assert.equal(airGapTx.amount, "1000000000000000000", "amount was not properly extracted")
  })

  it('should correctly give details to a bitcoin tx', function () {
    const tx = {
      ins:
        [{
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
        }],
      outs:
        [{
          recipient: 'mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k',
          isChange: false,
          value: 10
        },
        {
          recipient: 'miiQwEJY9fCG6GD1BFtnVuWRS6zaTnNafq',
          isChange: true,
          value: 32391989
        }]
    }

    const bitcoin = new CoinLib.BitcoinProtocol()

    const airGapTx = bitcoin.getTransactionDetails(tx)

    assert.deepEqual(airGapTx.from, ["mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k", "mtb2Yx8rPUhYxdqPsH9nzT375QtWZ9XJcX"], "from-addresses were not properly extracted")
    assert.deepEqual(airGapTx.to, ["mi1ypWeso8oAxBxYZ8e2grCNBhW1hrbK8k"], "to-addresses were not properly extracted")
    assert.equal(airGapTx.fee, "27000", "fee was not properly extracted")
    assert.equal(airGapTx.amount, "10", "amount was not properly extracted")
  })
})