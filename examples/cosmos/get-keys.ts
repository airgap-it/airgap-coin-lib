import { CosmosProtocol } from '../../src'
import * as BIP39 from '../../src/dependencies/src/bip39-2.5.0/index'

const protocol: CosmosProtocol = new CosmosProtocol()

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

const seed: string = BIP39.mnemonicToSeed(mnemonic).toString('hex')

console.log(protocol.getPrivateKeyFromHexSecret(seed, protocol.standardDerivationPath).toString('hex'))
console.log(protocol.getPublicKeyFromHexSecret(seed, protocol.standardDerivationPath))
