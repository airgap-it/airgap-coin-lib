import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SCALEEra } from '../scale/type/SCALEEra'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEEncodeConfig, SCALEType } from '../scale/type/SCALEType'

import { SubstrateTransactionMethod } from './method/SubstrateTransactionMethod'
import { SubstrateTransaction, SubstrateTransactionType } from './SubstrateTransaction'

interface PayloadConfig {
  lastHash: string
  genesisHash: string
  specVersion: number | BigNumber
  transactionVersion: number | BigNumber
}

export class SubstrateTransactionPayload extends SCALEClass {
  public static create<Network extends SubstrateNetwork>(
    transaction: SubstrateTransaction<Network>,
    config: PayloadConfig
  ): SubstrateTransactionPayload {
    return new SubstrateTransactionPayload(
      transaction.method,
      transaction.era,
      transaction.nonce,
      transaction.tip,
      SCALEInt.from(config.specVersion, 32),
      SCALEInt.from(config.transactionVersion, 32),
      SCALEHash.from(config.genesisHash),
      SCALEHash.from(transaction.era.isMortal ? config.lastHash : config.genesisHash)
    )
  }

  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    type: SubstrateTransactionType,
    hex: string
  ): SCALEDecodeResult<SubstrateTransactionPayload> {
    const decoder = new SCALEDecoder(network, runtimeVersion, hex)

    const method = decoder.decodeNextObject((network, runtimeVersion, hex) =>
      SubstrateTransactionMethod.decode(network, runtimeVersion, type, hex)
    )
    const era = decoder.decodeNextEra()
    const nonce = decoder.decodeNextCompactInt()
    const tip = decoder.decodeNextCompactInt()
    const specVersion = decoder.decodeNextInt(32)
    const transactionVersion = decoder.decodeNextInt(32)
    const genesisHash = decoder.decodeNextHash(256)
    const blockHash = decoder.decodeNextHash(256)

    return {
      bytesDecoded:
        method.bytesDecoded +
        era.bytesDecoded +
        nonce.bytesDecoded +
        tip.bytesDecoded +
        specVersion.bytesDecoded +
        transactionVersion.bytesDecoded +
        genesisHash.bytesDecoded +
        blockHash.bytesDecoded,
      decoded: new SubstrateTransactionPayload(
        method.decoded,
        era.decoded,
        nonce.decoded,
        tip.decoded,
        specVersion.decoded,
        transactionVersion.decoded,
        genesisHash.decoded,
        blockHash.decoded
      )
    }
  }

  protected readonly scaleFields = [
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
    readonly specVersion: SCALEInt,
    readonly transactionVersion: SCALEInt,
    readonly genesisHash: SCALEHash,
    readonly blockHash: SCALEHash
  ) {
    super()
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    return this.scaleFields.reduce(
      (encoded: string, current: SCALEType) => encoded + current.encode({ runtimeVersion: this.specVersion.toNumber(), ...config }),
      ''
    )
  }
}
