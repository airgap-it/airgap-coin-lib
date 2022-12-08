import { bytesToHex, stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { isPublicKey } from '@airgap/module-kit'
import { SubstrateProtocolConfiguration } from '../../../types/configuration'
import { isSubstrateAddress, SubstrateAccountId, SubstrateAddress } from '../../account/address/SubstrateAddress'
import { substrateAddressFactory, TypedSubstrateAddress } from '../../account/address/SubstrateAddressFactory'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export class SCALEAccountId<C extends SubstrateProtocolConfiguration> extends SCALEType {
  public static from<C extends SubstrateProtocolConfiguration>(
    value: string | Uint8Array | Buffer | TypedSubstrateAddress<C>,
    configuration: C
  ): SCALEAccountId<C> {
    const address: TypedSubstrateAddress<C> = isSubstrateAddress(value)
      ? value
      : substrateAddressFactory(configuration).from(bytesToHex(value))

    return new SCALEAccountId(address)
  }

  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    hex: string,
    byteLength: number = 32
  ): SCALEDecodeResult<SCALEAccountId<C>> {
    const _hex = stripHexPrefix(hex).substr(0, byteLength * 2)

    return {
      bytesDecoded: Math.ceil(_hex.length / 2),
      decoded: SCALEAccountId.from(_hex, configuration)
    }
  }

  private constructor(readonly address: TypedSubstrateAddress<C>) {
    super()
  }

  public compare(other: SCALEAccountId<C> | SubstrateAccountId<TypedSubstrateAddress<C>>): number {
    if (typeof other === 'string' || isSubstrateAddress(other) || isPublicKey(other)) {
      return (this.address as SubstrateAddress).compare(other)
    } else {
      return (this.address as SubstrateAddress).compare(other.address)
    }
  }

  public asAddress(): string {
    return this.address.asString()
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
