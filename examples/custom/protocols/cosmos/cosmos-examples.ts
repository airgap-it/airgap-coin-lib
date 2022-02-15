import { CosmosProtocol } from '../../../../packages/core/src/protocols/cosmos/CosmosProtocol'

const mnemonic =
  'sick protect below book devote mention juice neck tent wrong fun either phone omit mango vacuum hedgehog run educate flag hundred famous duck garbage'
const cosmos = new CosmosProtocol()

const keyPair = cosmos.generateKeyPair(mnemonic)
const pubKey = keyPair.publicKey.toString('hex')
cosmos.getAddressFromPublicKey(pubKey).then((address) => {
  cosmos
    .prepareTransactionFromPublicKey(pubKey, [address.getValue()], ['0'], cosmos.feeDefaults.medium, { memo: 'testing' })
    .then((transaction) => {
      cosmos.signWithPrivateKey(keyPair.privateKey, transaction).then((signed) => {
        console.log('Signed Transaction:')
        console.log(signed)
      })
    })
  cosmos.getBalanceOfAddresses([address.getValue()]).then(console.log).catch(console.error)
})
