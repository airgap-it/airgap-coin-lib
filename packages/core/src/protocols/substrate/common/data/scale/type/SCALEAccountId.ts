import { bytesToHex, stripHexPrefix } from '../../../../../../utils/hex'
import {
  isSubstrateCompatAddress,
  SubstrateAccountId,
  substrateAddressFactory,
  SubstrateCompatAddressType,
  SubstrateCompatAddress
} from '../../../../compat/SubstrateCompatAddress'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export class SCALEAccountId<Network extends SubstrateNetwork> extends SCALEType {
  public static from<Network extends SubstrateNetwork>(
    value: string | Uint8Array | Buffer | SubstrateCompatAddressType[Network],
    network: Network
  ): SCALEAccountId<Network> {
    const address: SubstrateCompatAddressType[Network] = isSubstrateCompatAddress(value)
      ? value
      : substrateAddressFactory(network).from(bytesToHex(value))

    return new SCALEAccountId(address)
  }

  public static decode<Network extends SubstrateNetwork>(network: Network, hex: string, byteLength: number = 32): SCALEDecodeResult<SCALEAccountId<Network>> {
    const _hex = stripHexPrefix(hex).substr(0, byteLength * 2)

    return {
      bytesDecoded: Math.ceil(_hex.length / 2),
      decoded: SCALEAccountId.from(_hex, network)
    }
  }

  private constructor(readonly address: SubstrateCompatAddressType[Network]) {
    super()
  }

  public compare(other: SCALEAccountId<Network> | SubstrateAccountId<SubstrateCompatAddressType[Network]>): number {
    if (typeof other === 'string' || isSubstrateCompatAddress(other)) {
      return (this.address as SubstrateCompatAddress).compare(other)
    } else {
      return (this.address as SubstrateCompatAddress).compare(other.address)
    }
  }

  public asAddress(): string {
    return this.address.getValue()
  }

  public asBytes(): Buffer {
    return this.address.getBufferBytes()
  }

  public toString(): string {
    return this.address.getHexBytes()
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    return this.address.getHexBytes()
  }
}
