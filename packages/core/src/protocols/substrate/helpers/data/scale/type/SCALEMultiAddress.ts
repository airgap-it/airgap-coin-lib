import BigNumber from '../../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SubstrateAddress } from '../../account/SubstrateAddress'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEAccountId } from './SCALEAccountId'
import { SCALEBytes } from './SCALEBytes'
import { SCALEHash } from './SCALEHash'
import { SCALEInt } from './SCALEInt'
import { SCALEEncodeConfig, SCALEType } from './SCALEType'

export enum SCALEMultiAddressType {
  Id = 0,
  Index,
  Raw,
  Address32,
  Address20
}

type SCALEMultiAddressValue<T extends SCALEMultiAddressType> = T extends SCALEMultiAddressType.Id
  ? SCALEAccountId
  : T extends SCALEMultiAddressType.Index
  ? SCALEInt
  : T extends SCALEMultiAddressType.Raw
  ? SCALEBytes
  : T extends SCALEMultiAddressType.Address32
  ? SCALEHash
  : T extends SCALEMultiAddressType.Address20
  ? SCALEHash
  : never

export class SCALEMultiAddress<T extends SCALEMultiAddressType> extends SCALEType {
  public static isOfType<T extends SCALEMultiAddressType>(
    multiAddress: SCALEMultiAddress<SCALEMultiAddressType>,
    type: T
  ): multiAddress is SCALEMultiAddress<T> {
    return multiAddress.type === type
  }

  public static from(
    value: number | string | BigNumber,
    type: SCALEMultiAddressType.Index,
    network: SubstrateNetwork
  ): SCALEMultiAddress<SCALEMultiAddressType.Index>
  public static from<T extends Exclude<SCALEMultiAddressType, SCALEMultiAddressType.Index>>(
    value: string | Uint8Array | Buffer | SubstrateAddress,
    type: T,
    network: SubstrateNetwork
  ): SCALEMultiAddress<T>
  public static from<T extends SCALEMultiAddressType>(
    value: number | string | BigNumber | Uint8Array | Buffer | SubstrateAddress,
    type: T,
    network: SubstrateNetwork
  ): SCALEMultiAddress<T> {
    switch (type) {
      case SCALEMultiAddressType.Id:
        if (typeof value === 'number' || BigNumber.isBigNumber(value)) {
          throw new Error('SCALEMultiAddress#from: Invalid multi address value')
        }

        return new SCALEMultiAddress(type, SCALEAccountId.from(value, network) as SCALEMultiAddressValue<T>)
      case SCALEMultiAddressType.Index:
        if (typeof value !== 'number' && !BigNumber.isBigNumber(value)) {
          throw new Error('SCALEMultiAddress#from: Invalid multi address value')
        }

        return new SCALEMultiAddress(type, SCALEInt.from(value, network) as SCALEMultiAddressValue<T>)

      case SCALEMultiAddressType.Raw:
      case SCALEMultiAddressType.Address32:
      case SCALEMultiAddressType.Address20:
        throw new Error(`SCALEMultiAddress#from: Multi address type ${SCALEMultiAddressType[type]} not supported`)
      default:
        throw new Error('SCALEMultiAddress#from: Unknown multi address type')
    }
  }

  public static decode<T extends SCALEMultiAddressType = SCALEMultiAddressType>(
    network: SubstrateNetwork,
    hex: string,
    type?: T,
    runtimeVersion?: number
  ): SCALEDecodeResult<SCALEMultiAddress<T>> {
    const _hex = stripHexPrefix(hex)

    if (
      runtimeVersion !== undefined &&
      ((network === SubstrateNetwork.KUSAMA && runtimeVersion < 2028) || (network === SubstrateNetwork.POLKADOT && runtimeVersion < 28))
    ) {
      const accountId = SCALEAccountId.decode(network, _hex)

      return {
        bytesDecoded: accountId.bytesDecoded,
        decoded: new SCALEMultiAddress(SCALEMultiAddressType.Id, accountId.decoded) as SCALEMultiAddress<T>
      }
    }

    const prefix = parseInt(_hex.substr(0, 2), 16)
    if (type !== undefined && prefix !== type) {
      throw new Error(`SCALEMultiAddress#decode: Unexpected multi address type ${SCALEMultiAddressType[prefix]}`)
    }

    switch (prefix) {
      case SCALEMultiAddressType.Id:
        const accountId = SCALEAccountId.decode(network, _hex.slice(2))

        return {
          bytesDecoded: accountId.bytesDecoded + 1,
          decoded: new SCALEMultiAddress(SCALEMultiAddressType.Id, accountId.decoded) as SCALEMultiAddress<T>
        }
      case SCALEMultiAddressType.Index:
        const index = SCALEInt.decode(_hex.slice(2), 32)

        return {
          bytesDecoded: index.bytesDecoded + 1,
          decoded: new SCALEMultiAddress(SCALEMultiAddressType.Index, index.decoded) as SCALEMultiAddress<T>
        }
      case SCALEMultiAddressType.Raw:
        const bytes = SCALEBytes.decode(_hex.slice(2))

        return {
          bytesDecoded: bytes.bytesDecoded + 1,
          decoded: new SCALEMultiAddress(SCALEMultiAddressType.Raw, bytes.decoded) as SCALEMultiAddress<T>
        }
      case SCALEMultiAddressType.Address32:
        const bytes32 = SCALEHash.decode(_hex.slice(2), 32)

        return {
          bytesDecoded: bytes32.bytesDecoded + 1,
          decoded: new SCALEMultiAddress(SCALEMultiAddressType.Address32, bytes32.decoded) as SCALEMultiAddress<T>
        }
      case SCALEMultiAddressType.Address20:
        const bytes20 = SCALEHash.decode(_hex.slice(2), 20)

        return {
          bytesDecoded: bytes20.bytesDecoded + 1,
          decoded: new SCALEMultiAddress(SCALEMultiAddressType.Address20, bytes20.decoded) as SCALEMultiAddress<T>
        }
      default:
        if (
          runtimeVersion === undefined ||
          (network === SubstrateNetwork.KUSAMA && runtimeVersion >= 2028) ||
          (network === SubstrateNetwork.POLKADOT && runtimeVersion >= 28)
        ) {
          throw new Error('SCALEMultiAddress#decode: Unknown multi address type')
        } else {
          const accountId = SCALEAccountId.decode(network, _hex)

          return {
            bytesDecoded: accountId.bytesDecoded,
            decoded: new SCALEMultiAddress(SCALEMultiAddressType.Id, accountId.decoded) as SCALEMultiAddress<T>
          }
        }
    }
  }

  private constructor(readonly type: T, readonly value: SCALEMultiAddressValue<T>) {
    super()
  }

  public toString(): string {
    return this.value.toString()
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    if (
      config?.network === undefined ||
      config?.runtimeVersion === undefined ||
      (config?.network === SubstrateNetwork.KUSAMA && config?.runtimeVersion >= 2028) ||
      (config?.network === SubstrateNetwork.POLKADOT && config?.runtimeVersion >= 28)
    ) {
      return toHexStringRaw(this.type, 2) + (this.value?.encode(config) ?? '')
    } else {
      return this.value?.encode(config) ?? ''
    }
  }
}
