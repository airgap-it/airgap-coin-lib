import { CosmosProtocol } from '../../../src'
import * as BIP39 from '../../../src/dependencies/src/bip39-2.5.0/index'

const protocol: CosmosProtocol = new CosmosProtocol()

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

const seed: string = BIP39.mnemonicToSeed(mnemonic).toString('hex')

const secKey = protocol.getPrivateKeyFromHexSecret(seed, protocol.standardDerivationPath)
const pubKey = protocol.getPublicKeyFromHexSecret(seed, protocol.standardDerivationPath)

protocol
  .prepareTransactionFromPublicKey(pubKey, ['cosmos1w3mea9ghfdc3r7ax45mehl2tcqw9p0vnlhl0p6'], ['2'], '1')
  .then((tx) => {
    console.log(JSON.stringify(tx))
    protocol.signWithPrivateKey(secKey, tx).then((signed) => {
      console.log('signed', signed)
    })
  })
  .catch((error) => console.log(error))
