import { CoinAddress } from '../../ICoinProtocol'
import { AstarAddress } from '../astar/AstarAddress'
import { SCALEDecodeResult } from '../common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '../common/data/scale/type/SCALEAccountId'
import { SCALEMultiAddress, SCALEMultiAddressType } from '../common/data/scale/type/SCALEMultiAddress'
import { SCALEType } from '../common/data/scale/type/SCALEType'
import { KusamaAddress } from '../kusama/KusamaAddress'
import { MoonbeamAddress } from '../moonbeam/data/account/MoonbeamAddress'
import { PolkadotAddress } from '../polkadot/PolkadotAddress'
import { SubstrateNetwork } from '../SubstrateNetwork'

export type SubstrateAccountId<T extends SubstrateCompatAddress> = string | T

export interface SubstrateAddressFactory<Network extends SubstrateNetwork> {
  from(accountId: SubstrateAccountId<SubstrateCompatAddressType[Network]>): SubstrateCompatAddressType[Network]
  getPlaceholder(): SubstrateCompatAddressType[Network]
}

export interface SCALEAddressFactory<Network extends SubstrateNetwork> {
  from(value: string | Uint8Array | Buffer | SubstrateCompatAddressType[Network], network: Network): SCALECompatAddressType[Network]
  decode(network: Network, runtimeVersion: number | undefined, hex: string): SCALEDecodeResult<SCALECompatAddressType[Network]>
}

export interface SubstrateCompatAddressType extends Record<SubstrateNetwork, SubstrateCompatAddress> {
  [SubstrateNetwork.POLKADOT]: PolkadotAddress
  [SubstrateNetwork.KUSAMA]: KusamaAddress
  [SubstrateNetwork.MOONBEAM]: MoonbeamAddress
  [SubstrateNetwork.ASTAR]: AstarAddress
}

export interface SCALECompatAddressType extends Record<SubstrateNetwork, SCALEType> {
  [SubstrateNetwork.POLKADOT]: SCALEMultiAddress<SCALEMultiAddressType.Id, SubstrateNetwork.POLKADOT>
  [SubstrateNetwork.KUSAMA]: SCALEMultiAddress<SCALEMultiAddressType.Id, SubstrateNetwork.KUSAMA>
  [SubstrateNetwork.MOONBEAM]: SCALEAccountId<SubstrateNetwork.MOONBEAM>
  [SubstrateNetwork.ASTAR]: SCALEAccountId<SubstrateNetwork.ASTAR>
}

export function substrateAddressFactory<Network extends SubstrateNetwork>(substrateNetwork: Network): SubstrateAddressFactory<Network> {
  switch (substrateNetwork) {
    case SubstrateNetwork.POLKADOT:
      return {
        from: PolkadotAddress.from,
        getPlaceholder: PolkadotAddress.getPlaceholder
      } as SubstrateAddressFactory<Network>
    case SubstrateNetwork.KUSAMA:
      return {
        from: KusamaAddress.from,
        getPlaceholder: KusamaAddress.createPlaceholder
      } as SubstrateAddressFactory<Network>
    case SubstrateNetwork.MOONBEAM:
      return {
        from: MoonbeamAddress.from,
        getPlaceholder: MoonbeamAddress.getPlaceholder
      } as SubstrateAddressFactory<Network>
    case SubstrateNetwork.ASTAR:
      return {
        from: AstarAddress.from,
        getPlaceholder: AstarAddress.getPlaceholder
      } as SubstrateAddressFactory<Network>
    default:
      throw new Error('Unknown Substrate network')
  }
}

export function scaleAddressFactory<Network extends SubstrateNetwork>(substrateNetwork: Network): SCALEAddressFactory<Network> {
  switch (substrateNetwork) {
    case SubstrateNetwork.POLKADOT:
      return ({
        from: (value: string | Uint8Array | Buffer | SubstrateCompatAddressType[Network], network: Network) =>
          SCALEMultiAddress.from(value, SCALEMultiAddressType.Id, network),
        decode: (network: Network, runtimeVersion: number | undefined, hex: string) =>
          SCALEMultiAddress.decode(network, hex, SCALEMultiAddressType.Id, runtimeVersion)
      } as unknown) as SCALEAddressFactory<Network>
    case SubstrateNetwork.KUSAMA:
      return ({
        from: (value: string | Uint8Array | Buffer | SubstrateCompatAddressType[Network], network: Network) =>
          SCALEMultiAddress.from(value, SCALEMultiAddressType.Id, network),
        decode: (network: Network, runtimeVersion: number | undefined, hex: string) =>
          SCALEMultiAddress.decode(network, hex, SCALEMultiAddressType.Id, runtimeVersion)
      } as unknown) as SCALEAddressFactory<Network>
    case SubstrateNetwork.MOONBEAM:
      return ({
        from: SCALEAccountId.from,
        decode: (network: Network, _: number | undefined, hex: string) => SCALEAccountId.decode(network, hex, 20)
      } as unknown) as SCALEAddressFactory<Network>
    case SubstrateNetwork.ASTAR:
      return ({
        from: (value: string | Uint8Array | Buffer | SubstrateCompatAddressType[Network], network: Network) =>
          SCALEMultiAddress.from(value, SCALEMultiAddressType.Id, network),
        decode: (network: Network, runtimeVersion: number | undefined, hex: string) =>
          SCALEMultiAddress.decode(network, hex, SCALEMultiAddressType.Id, runtimeVersion)
      } as unknown) as SCALEAddressFactory<Network>
    default:
      throw new Error('Unknown Substrate network')
  }
}

export interface SubstrateCompatAddress extends CoinAddress {
  compare(other: SubstrateAccountId<this>): number
  getBufferBytes(): Buffer
  getHexBytes(): string
}

export function isSubstrateCompatAddress(address: unknown): address is SubstrateCompatAddress {
  return address instanceof Object && 'compare' in address && 'getBufferBytes' in address && 'getHexBytes' in address
}
