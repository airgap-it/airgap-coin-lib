import { CosmosProtocol } from '../src/protocols/cosmos/CosmosProtocol'
import BigNumber from 'bignumber.js'

const mnemonic =
  'sick protect below book devote mention juice neck tent wrong fun either phone omit mango vacuum hedgehog run educate flag hundred famous duck garbage'
const cosmos = new CosmosProtocol()
const keyPair = cosmos.generateKeyPair(mnemonic)
const pubKey = keyPair.publicKey.toString('hex')
cosmos.getAddressFromPublicKey(pubKey).then(address => {
  cosmos.prepareTransactionFromPublicKey(pubKey, [address], [new BigNumber(0)], cosmos.feeDefaults.medium, 'testing').then(transaction => {
    cosmos.signWithPrivateKey(keyPair.privateKey, transaction).then(signed => {
      console.log('Signed Transaction:')
      console.log(signed)
    })
  })
})

// cosmos
//   .getAddressFromPublicKey('02716db8816dacbe68b7c010b50d42c462dad0851a2e80341427ad8b427a7217a9')
//   .then(result => console.log('Address: ' + result))
