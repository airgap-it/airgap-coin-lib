import { bytesToHex, stripHexPrefix } from '../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SubstrateAddress } from '../../account/SubstrateAddress'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export class SCALEAccountId extends SCALEType {
  public static from(value: string | Uint8Array | Buffer | SubstrateAddress, network: SubstrateNetwork): SCALEAccountId {
    const address: SubstrateAddress = value instanceof SubstrateAddress ? value : SubstrateAddress.from(bytesToHex(value), network)

    return new SCALEAccountId(address)
  }

  public static decode(network: SubstrateNetwork, hex: string): SCALEDecodeResult<SCALEAccountId> {
    const _hex = stripHexPrefix(hex)

    return {
      bytesDecoded: 32,
      decoded: SCALEAccountId.from(_hex.substr(0, 64), network)
    }
  }

  private constructor(readonly address: SubstrateAddress) {
    super()
  }

  public compare(other: SCALEAccountId): number {
    return this.address.compare(other.address)
  }

  public asAddress(): string {
    return this.address.getValue()
  }

  public asBytes(): Buffer {
    return this.address.getBufferPublicKey()
  }

  public toString(): string {
    return this.address.getHexPublicKey()
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    return this.address.getHexPublicKey()
  }
}
