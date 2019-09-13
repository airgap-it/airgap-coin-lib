import { CosmosProtocol } from '../src/protocols/cosmos/CosmosProtocol'

const cosmos = new CosmosProtocol()

cosmos
  .getAddressFromPublicKey('02716db8816dacbe68b7c010b50d42c462dad0851a2e80341427ad8b427a7217a9')
  .then(result => console.log('Address: ' + result))
