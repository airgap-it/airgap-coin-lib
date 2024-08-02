import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SCALEEra } from '../scale/type/SCALEEra'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEEncodeConfig, SCALEType } from '../scale/type/SCALEType'

import { SubstrateTransactionMethod } from './method/SubstrateTransactionMethod'
import { SubstrateTransaction, SubstrateTransactionType } from './SubstrateTransaction'
import { SCALEOptional } from '../scale/type/SCALEOptional'

interface PayloadConfig {
  lastHash: string
  genesisHash: string
  specVersion: number | BigNumber
  transactionVersion: number | BigNumber
  metadataHash?: string
}

export class SubstrateTransactionPayload extends SCALEClass {
  public static create<C extends SubstrateProtocolConfiguration>(
    transaction: SubstrateTransaction<C>,
    config: PayloadConfig
  ): SubstrateTransactionPayload {
    return new SubstrateTransactionPayload(
      transaction.method,
      transaction.era,
      transaction.nonce,
      transaction.tip,
      SCALEInt.from(config.metadataHash ? 1 : 0),
      SCALEInt.from(config.specVersion, 32),
      SCALEInt.from(config.transactionVersion, 32),
      SCALEHash.from(config.genesisHash),
      SCALEHash.from(transaction.era.isMortal ? config.lastHash : config.genesisHash),
      config.metadataHash ? SCALEOptional.from(SCALEHash.from(config.metadataHash)) : SCALEOptional.empty()
    )
  }

  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    type: SubstrateTransactionType<C>,
    hex: string
  ): SCALEDecodeResult<SubstrateTransactionPayload> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, hex)

    const method = decoder.decodeNextObject((configuration, runtimeVersion, hex) =>
      SubstrateTransactionMethod.decode(configuration, runtimeVersion, type, hex)
    )

    const versionCheck = configuration.transaction.version >= 4
    const era = decoder.decodeNextEra()
    const nonce = decoder.decodeNextCompactInt()
    const tip = decoder.decodeNextCompactInt()
    const mode = versionCheck ? decoder.decodeNextInt(8) : { bytesDecoded: 0, decoded: SCALEInt.from(0) }
    const specVersion = decoder.decodeNextInt(32)
    const transactionVersion = decoder.decodeNextInt(32)
    const genesisHash = decoder.decodeNextHash(256)
    const blockHash = decoder.decodeNextHash(256)
    const metadataHash = versionCheck
      ? decoder.decodeNextOptional((_configuration, _runtimeversion, hex) => SCALEHash.decode(hex, 256))
      : { bytesDecoded: 0, decoded: SCALEOptional.empty<SCALEHash>() }

    return {
      bytesDecoded:
        method.bytesDecoded +
        era.bytesDecoded +
        nonce.bytesDecoded +
        tip.bytesDecoded +
        mode.bytesDecoded +
        specVersion.bytesDecoded +
        transactionVersion.bytesDecoded +
        genesisHash.bytesDecoded +
        blockHash.bytesDecoded +
        metadataHash.bytesDecoded,
      decoded: new SubstrateTransactionPayload(
        method.decoded,
        era.decoded,
        nonce.decoded,
        tip.decoded,
        mode.decoded,
        specVersion.decoded,
        transactionVersion.decoded,
        genesisHash.decoded,
        blockHash.decoded,
        metadataHash.decoded
      )
    }
  }

  protected readonly scaleFields = [
    this.method,
    this.era,
    this.nonce,
    this.tip,
    this.mode,
    this.specVersion,
    this.transactionVersion,
    this.genesisHash,
    this.blockHash,
    this.metadataHash
  ]

  protected readonly scaleFieldsv3 = [
    this.method,
    this.era,
    this.nonce,
    this.tip,
    this.specVersion,
    this.transactionVersion,
    this.genesisHash,
    this.blockHash
  ]

  private constructor(
    readonly method: SubstrateTransactionMethod,
    readonly era: SCALEEra,
    readonly nonce: SCALECompactInt,
    readonly tip: SCALECompactInt,
    readonly mode: SCALEInt,
    readonly specVersion: SCALEInt,
    readonly transactionVersion: SCALEInt,
    readonly genesisHash: SCALEHash,
    readonly blockHash: SCALEHash,
    readonly metadataHash: SCALEOptional<SCALEHash>
  ) {
    super()
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    const version = config?.configuration?.transaction.version

    return version !== undefined && version >= 4
      ? this.scaleFields.reduce(
          (encoded: string, current: SCALEType) => encoded + current.encode({ runtimeVersion: this.specVersion.toNumber(), ...config }),
          ''
        )
      : this.scaleFieldsv3.reduce(
          (encoded: string, current: SCALEType) => encoded + current.encode({ runtimeVersion: this.specVersion.toNumber(), ...config }),
          ''
        )
  }
}
