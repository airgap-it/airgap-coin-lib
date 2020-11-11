import { generateId, IACMessageDefinitionObject, IACMessageType, Serializer } from '../../../../src'
import * as bs58check from '../../../../src/dependencies/src/bs58check-2.1.2'
import { SubstrateAddress } from '../../../../src/protocols/substrate/helpers/data/account/SubstrateAddress'
import { SubstrateNetwork } from '../../../../src/protocols/substrate/SubstrateNetwork'
import { MainProtocolSymbols } from '../../../../src/utils/ProtocolSymbols'

const address: string = '12QceCDMHcK6qgnxLJsMBQPLAA6iX8WCuSx7dChcsNNnBtKg'

const getPubkeyFromAddress = async (address: string): Promise<string> => {
  const substrateAddress: SubstrateAddress = SubstrateAddress.from(address, SubstrateNetwork.POLKADOT)

  return substrateAddress.getHexPublicKey()
}

getPubkeyFromAddress(address).then(async (pubkey) => {
  console.log(pubkey)

  const accountShareMessage: IACMessageDefinitionObject = {
    id: generateId(10),
    type: IACMessageType.AccountShareResponse,
    protocol: MainProtocolSymbols.POLKADOT,
    payload: {
      publicKey: pubkey,
      derivationPath: 'unknown', // This could be replaced by the default derivation path
      isExtendedPublicKey: false
    }
  }

  const serializer = new Serializer()

  const result = await serializer.serialize([accountShareMessage])

  // Generate QR here: https://kazuhikoarase.github.io/qrcode-generator/js/demo/
  console.log(result[0])
})