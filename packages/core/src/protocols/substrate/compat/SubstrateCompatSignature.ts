import { SCALEDecodeResult } from '../common/data/scale/SCALEDecoder'
import { SubstrateSignature, SubstrateSignatureType } from '../common/data/transaction/SubstrateSignature'
import { MoonbeamSignature } from '../moonbeam/data/transaction/MoonbeamSignature'
import { SubstrateNetwork } from '../SubstrateNetwork'

export interface SubstrateSignatureFactory<Network extends SubstrateNetwork> {
  create(type: SubstrateSignatureType, signature?: string | Uint8Array | Buffer): SubstrateCompatSignatureType[Network]
  decode(network: Network, runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<SubstrateCompatSignatureType[Network]>
}

export interface SubstrateCompatSignatureType extends Record<SubstrateNetwork, SubstrateSignature> {
  [SubstrateNetwork.POLKADOT]: SubstrateSignature
  [SubstrateNetwork.KUSAMA]: SubstrateSignature
  [SubstrateNetwork.MOONBEAM]: MoonbeamSignature
  [SubstrateNetwork.ASTAR]: SubstrateSignature
}

export function substrateSignatureFactory<Network extends SubstrateNetwork>(substrateNetwork: Network): SubstrateSignatureFactory<Network> {
  switch (substrateNetwork) {
    case SubstrateNetwork.POLKADOT:
      return ({
        create: SubstrateSignature.create,
        decode: SubstrateSignature.decode
      } as unknown) as SubstrateSignatureFactory<Network>
    case SubstrateNetwork.KUSAMA:
      return ({
        create: SubstrateSignature.create,
        decode: SubstrateSignature.decode
      } as unknown) as SubstrateSignatureFactory<Network>
    case SubstrateNetwork.MOONBEAM:
      return ({
        create: MoonbeamSignature.create,
        decode: MoonbeamSignature.decode
      } as unknown) as SubstrateSignatureFactory<Network>
    case SubstrateNetwork.ASTAR:
      return ({
        create: SubstrateSignature.create,
        decode: SubstrateSignature.decode
      } as unknown) as SubstrateSignatureFactory<Network>
    default:
      throw new Error('Unknown Substrate network')
  }
}
