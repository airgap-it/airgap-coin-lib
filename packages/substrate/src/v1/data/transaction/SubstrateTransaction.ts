import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { AirGapTransaction } from '@airgap/module-kit'
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SubstrateAccountId } from '../account/address/SubstrateAddress'
import { scaleAddressFactory, TypedSCALEAddress, TypedSubstrateAddress } from '../account/address/SubstrateAddressFactory'
import { SubstrateCall } from '../metadata/decorator/call/SubstrateCall'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEBytes } from '../scale/type/SCALEBytes'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { EraConfig, SCALEEra } from '../scale/type/SCALEEra'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEEncodeConfig, SCALEType } from '../scale/type/SCALEType'

import { SubstrateTransactionMethod } from './method/SubstrateTransactionMethod'
import { SubstrateSignature, SubstrateSignatureType } from './SubstrateSignature'

const VERSION = 4
const BIT_SIGNED = 128
const BIT_UNSIGNED = 128 // TODO: change to 0 if payment_queryInfo recognizes the transaction, at the moment it returns "No such variant in enum Call" error

interface SubstrateTransactionParametersBase<C extends SubstrateProtocolConfiguration> {
  from: SubstrateAccountId<TypedSubstrateAddress<C>>
  args: any
  tip: number | BigNumber
  methodId: SubstrateCall
  era: EraConfig | null
  nonce: number | BigNumber
}

interface SubstrateTransactionParametersWithSignature<C extends SubstrateProtocolConfiguration>
  extends SubstrateTransactionParametersBase<C> {
  signature: SubstrateSignature
}

interface SubstrateTransactionParametersWithSignatureType<C extends SubstrateProtocolConfiguration>
  extends SubstrateTransactionParametersBase<C> {
  signatureType: SubstrateSignatureType
}

type SubstrateTransactionParameters<C extends SubstrateProtocolConfiguration> =
  | SubstrateTransactionParametersWithSignature<C>
  | SubstrateTransactionParametersWithSignatureType<C>

function areParametersWithSignature<C extends SubstrateProtocolConfiguration>(
  config: Partial<SubstrateTransactionParameters<C>>
): config is SubstrateTransactionParametersWithSignature<C> {
  return (config as SubstrateTransactionParametersWithSignature<C>).signature !== undefined
}

export type SubstrateTransactionType<C extends SubstrateProtocolConfiguration> = 'transfer' | C['transaction']['types']

export class SubstrateTransaction<C extends SubstrateProtocolConfiguration> extends SCALEClass {
  public static create<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    type: SubstrateTransactionType<C>,
    params: SubstrateTransactionParameters<C>
  ): SubstrateTransaction<C> {
    return new SubstrateTransaction(
      configuration,
      type,
      scaleAddressFactory(configuration).from(params.from, configuration),
      areParametersWithSignature(params) ? params.signature : SubstrateSignature.create(params.signatureType),
      params.era ? SCALEEra.Mortal(params.era) : SCALEEra.Immortal(),
      SCALECompactInt.from(params.nonce),
      SCALECompactInt.from(params.tip),
      SubstrateTransactionMethod.create(configuration, type, params.methodId.palletIndex, params.methodId.callIndex, params.args)
    )
  }

  public static fromTransaction<C extends SubstrateProtocolConfiguration>(
    transaction: SubstrateTransaction<C>,
    params?: Partial<SubstrateTransactionParameters<C>>
  ): SubstrateTransaction<C> {
    return new SubstrateTransaction(
      transaction.configuration,
      transaction.type,
      params && params.from
        ? scaleAddressFactory(transaction.configuration).from(params.from, transaction.configuration)
        : transaction.signer,
      params && areParametersWithSignature(params) ? params.signature : transaction.signature,
      params && params.era ? SCALEEra.Mortal(params.era) : transaction.era,
      params && params.nonce ? SCALECompactInt.from(params.nonce) : transaction.nonce,
      params && params.tip ? SCALECompactInt.from(params.tip) : transaction.tip,
      params && params.args && params.methodId
        ? SubstrateTransactionMethod.create(
            transaction.configuration,
            transaction.type,
            params.methodId.palletIndex,
            params.methodId.callIndex,
            params.args
          )
        : transaction.method
    )
  }

  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    type: SubstrateTransactionType<C>,
    raw: string
  ): SCALEDecodeResult<SubstrateTransaction<C>> {
    const bytes = SCALEBytes.decode(stripHexPrefix(raw))
    const decoder = new SCALEDecoder(configuration, runtimeVersion, bytes.decoded.bytes.toString('hex'))

    decoder.decodeNextHash(8) // signed byte
    const signer = decoder.decodeNextAccount()
    const signature = decoder.decodeNextObject(SubstrateSignature.decode)
    const era = decoder.decodeNextEra()
    const nonce = decoder.decodeNextCompactInt()
    const tip = decoder.decodeNextCompactInt()
    const method = decoder.decodeNextObject((configuration, runtimeVersion, hex) =>
      SubstrateTransactionMethod.decode(configuration, runtimeVersion, type, hex)
    )

    return {
      bytesDecoded: bytes.bytesDecoded,
      decoded: new SubstrateTransaction(
        configuration,
        type,
        signer.decoded,
        signature.decoded,
        era.decoded,
        nonce.decoded,
        tip.decoded,
        method.decoded
      )
    }
  }

  protected scaleFields = [this.signer, this.signature, this.era, this.nonce, this.tip, this.method]

  private constructor(
    readonly configuration: C,
    readonly type: SubstrateTransactionType<C>,
    readonly signer: TypedSCALEAddress<C>,
    readonly signature: SubstrateSignature,
    readonly era: SCALEEra,
    readonly nonce: SCALECompactInt,
    readonly tip: SCALECompactInt,
    readonly method: SubstrateTransactionMethod
  ) {
    super()
  }

  public toString(): string {
    return JSON.stringify(
      {
        type: this.type,
        signer: this.signer.toString(),
        signature: JSON.parse(this.signature.toString()),
        era: JSON.parse(this.era.toString()),
        nonce: this.nonce.toNumber(),
        tip: this.tip.toNumber(),
        method: JSON.parse(this.method.toString())
      },
      null,
      2
    )
  }

  public toAirGapTransactions(): Partial<AirGapTransaction>[] {
    const airGapTransaction = {
      from: [this.signer.asAddress()],
      to: [this.signer.asAddress()],
      extra: this.type !== 'transfer' ? { type: this.type } : undefined,
      transactionDetails: JSON.parse(this.toString())
    }
    const parts = this.method.toAirGapTransactionParts()

    return parts.length > 0 ? parts.map((part) => Object.assign(airGapTransaction, part)) : [airGapTransaction]
  }

  protected _encode(config?: SCALEEncodeConfig): string {
    const typeEncoded = SCALEHash.from(new Uint8Array([VERSION | (this.signature.isSigned ? BIT_SIGNED : BIT_UNSIGNED)])).encode(config)
    const bytes = Buffer.from(
      typeEncoded + this.scaleFields.reduce((encoded: string, struct: SCALEType) => encoded + struct.encode(config), ''),
      'hex'
    )

    return SCALEBytes.from(bytes).encode(config)
  }
}
