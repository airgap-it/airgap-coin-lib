import { IACMessageDefinitionObject, IACMessageType, Serializer } from '../../../../packages/core/src'
import Axios from '../../../../packages/core/src/dependencies/src/axios-0.19.0'
import * as bs58check from '../../../../packages/core/src/dependencies/src/bs58check-2.1.2'
import { MainProtocolSymbols } from '../../../../packages/core/src/utils/ProtocolSymbols'

const address: string = 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7'

const getPubkeyFromAddress = async (address: string): Promise<string> => {
  const url = `https://tezos-mainnet-node-1.kubernetes.papers.tech/chains/main/blocks/head/context/contracts/${address}/manager_key`

  const response = await Axios.get(url)

  const publicKey = response.data

  if (publicKey.startsWith('edpk') && publicKey.length === 54) {
    const edpkPrefixLength = 4
    const decoded = bs58check.decode(publicKey)

    return decoded.slice(edpkPrefixLength, decoded.length).toString('hex')
  }

  return publicKey
}

getPubkeyFromAddress(address).then(async (pubkey) => {
  console.log(pubkey)

  const accountShareMessage: IACMessageDefinitionObject = {
    type: IACMessageType.AccountShareResponse,
    protocol: MainProtocolSymbols.XTZ,
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
