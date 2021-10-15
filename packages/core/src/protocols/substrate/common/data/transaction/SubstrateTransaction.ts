import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../../interfaces/IAirGapTransaction'
import { stripHexPrefix } from '../../../../../utils/hex'
import {
  scaleAddressFactory,
  SCALECompatAddressType,
  SubstrateAccountId,
  SubstrateCompatAddressType
} from '../../../compat/SubstrateCompatAddress'
import { SubstrateCompatSignatureType, substrateSignatureFactory } from '../../../compat/SubstrateCompatSignature'
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SubstrateCall } from '../metadata/decorator/call/SubstrateCall'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEBytes } from '../scale/type/SCALEBytes'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { EraConfig, SCALEEra } from '../scale/type/SCALEEra'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEEncodeConfig, SCALEType } from '../scale/type/SCALEType'

import { SubstrateTransactionMethod } from './method/SubstrateTransactionMethod'
import { SubstrateSignatureType } from './SubstrateSignature'

const VERSION = 4
const BIT_SIGNED = 128
const BIT_UNSIGNED = 128 // TODO: change to 0 if payment_queryInfo recognizes the transaction, at the moment it returns "No such variant in enum Call" error

interface SubstrateTransactionConfigBase<Network extends SubstrateNetwork> {
  from: SubstrateAccountId<SubstrateCompatAddressType[Network]>
  args: any
  tip: number | BigNumber
  methodId: SubstrateCall
  era: EraConfig | null
  nonce: number | BigNumber
}

interface SubstrateTransactionConfigWithSignature<Network extends SubstrateNetwork> extends SubstrateTransactionConfigBase<Network> {
  signature: SubstrateCompatSignatureType[Network]
}

interface SubstrateTransactionConfigWithSignatureType<Network extends SubstrateNetwork> extends SubstrateTransactionConfigBase<Network> {
  signatureType: SubstrateSignatureType
}

type SubstrateTransactionConfig<Network extends SubstrateNetwork> =
  | SubstrateTransactionConfigWithSignature<Network>
  | SubstrateTransactionConfigWithSignatureType<Network>

function isConfigWithSignature<Network extends SubstrateNetwork>(
  config: Partial<SubstrateTransactionConfig<Network>>
): config is SubstrateTransactionConfigWithSignature<Network> {
  return (config as SubstrateTransactionConfigWithSignature<Network>).signature !== undefined
}

export enum SubstrateTransactionType {
  TRANSFER,
  BOND,
  UNBOND,
  REBOND,
  BOND_EXTRA,
  WITHDRAW_UNBONDED,
  NOMINATE,
  CANCEL_NOMINATION,
  COLLECT_PAYOUT,
  SET_PAYEE,
  SET_CONTROLLER,
  SUBMIT_BATCH,

  // Moonbeam, TODO: separate
  M_NOMINATE,
  M_LEAVE_NOMINATORS,
  M_REVOKE_NOMINATION,
  M_NOMINATOR_BOND_MORE,
  M_NOMINATOR_BOND_LESS
}

export class SubstrateTransaction<Network extends SubstrateNetwork> extends SCALEClass {
  public static create<Network extends SubstrateNetwork>(
    network: Network,
    type: SubstrateTransactionType,
    config: SubstrateTransactionConfig<Network>
  ): SubstrateTransaction<Network> {
    return new SubstrateTransaction(
      network,
      type,
      scaleAddressFactory(network).from(config.from, network),
      isConfigWithSignature(config) ? config.signature : substrateSignatureFactory(network).create(config.signatureType),
      config.era ? SCALEEra.Mortal(config.era) : SCALEEra.Immortal(),
      SCALECompactInt.from(config.nonce),
      SCALECompactInt.from(config.tip),
      SubstrateTransactionMethod.create(network, type, config.methodId.palletIndex, config.methodId.callIndex, config.args)
    )
  }

  public static fromTransaction<Network extends SubstrateNetwork>(
    transaction: SubstrateTransaction<Network>,
    config?: Partial<SubstrateTransactionConfig<Network>>
  ): SubstrateTransaction<Network> {
    return new SubstrateTransaction(
      transaction.network,
      transaction.type,
      config && config.from ? scaleAddressFactory(transaction.network).from(config.from, transaction.network) : transaction.signer,
      config && isConfigWithSignature(config) ? config.signature : transaction.signature,
      config && config.era ? SCALEEra.Mortal(config.era) : transaction.era,
      config && config.nonce ? SCALECompactInt.from(config.nonce) : transaction.nonce,
      config && config.tip ? SCALECompactInt.from(config.tip) : transaction.tip,
      config && config.args && config.methodId
        ? SubstrateTransactionMethod.create(
            transaction.network,
            transaction.type,
            config.methodId.palletIndex,
            config.methodId.callIndex,
            config.args
          )
        : transaction.method
    )
  }

  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    type: SubstrateTransactionType,
    raw: string
  ): SCALEDecodeResult<SubstrateTransaction<Network>> {
    const bytes = SCALEBytes.decode(stripHexPrefix(raw))
    const decoder = new SCALEDecoder(network, runtimeVersion, bytes.decoded.bytes.toString('hex'))

    decoder.decodeNextHash(8) // signed byte
    const signer = decoder.decodeNextAccount()
    const signature = decoder.decodeNextObject(substrateSignatureFactory(network).decode)
    const era = decoder.decodeNextEra()
    const nonce = decoder.decodeNextCompactInt()
    const tip = decoder.decodeNextCompactInt()
    const method = decoder.decodeNextObject((network, runtimeVersion, hex) =>
      SubstrateTransactionMethod.decode(network, runtimeVersion, type, hex)
    )

    return {
      bytesDecoded: bytes.bytesDecoded,
      decoded: new SubstrateTransaction(
        network,
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
    readonly network: Network,
    readonly type: SubstrateTransactionType,
    readonly signer: SCALECompatAddressType[Network],
    readonly signature: SubstrateCompatSignatureType[Network],
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
        type: SubstrateTransactionType[this.type],
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

  public toAirGapTransactions(): Partial<IAirGapTransaction>[] {
    const airGapTransaction = {
      from: [this.signer.asAddress()],
      to: [this.signer.asAddress()],
      extra: this.type !== SubstrateTransactionType.TRANSFER ? { type: SubstrateTransactionType[this.type] } : undefined,
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
