const BIP39 = require('@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index')
const assert = require('assert')
const networks = require('@airgap/coinlib-core/networks')

const bitcoinJS = require('@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index')

const mnemonicPhrase = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey' // this is what the user writes down and what is saved by secure storage?
const masterSeed = BIP39.mnemonicToSeed(mnemonicPhrase)

const CoinLib = require('../dist/index')

describe('Extended Public Derivation Logic', function () {
  it('should return the correct ethereum address from extended public key', function (done) {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, bitcoinJS.networks.bitcoin)
    const publicKey = bitcoinHdNode.derivePath("m/44'/60'/0'").neutered().toBase58()
    const eth = new CoinLib.EthereumProtocol()

    eth
      .getAddressFromExtendedPublicKey(publicKey, 0, 0)
      .then((address) => {
        assert.equal(address.address, '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
        done()
      })
      .catch((error) => {
        done(error)
      })
  })
})

describe('Public Derivation Logic', function () {
  it('should return the correct ethereum address from extended public key', function (done) {
    const bitcoinHdNode = bitcoinJS.HDNode.fromSeedBuffer(masterSeed, networks.eth)
    const publicKey = bitcoinHdNode.derivePath("m/44'/60'/0'/0/0").neutered().getPublicKeyBuffer()
    const eth = new CoinLib.EthereumProtocol()

    eth
      .getAddressFromPublicKey(publicKey)
      .then((address) => {
        assert.equal(address.address, '0x4A1E1D37462a422873BFCCb1e705B05CC4bd922e')
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
})

describe('Raw Transaction Prepare', function () {
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
})

describe('Secret to Private Key Logic', function () {
  it('should return the correct ethereum private key for a given secret', async function () {
    const mnemonicPhrase = 'spot tiny surge pond spider defense tenant husband input vivid six reunion squirrel frequent syrup'
    const derivationPath = `m/44'/60'/0'/0/0`
    const privateKey = '0x0134c240a31c801e65ece657bb695e232de25232b82ff29238d344309ec6af29'

    const privateKeyBuffer = await new CoinLib.EthereumProtocol().getPrivateKeyFromMnemonic(mnemonicPhrase, derivationPath)
    assert.equal('0x' + privateKeyBuffer.toString('hex'), privateKey)
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
})
