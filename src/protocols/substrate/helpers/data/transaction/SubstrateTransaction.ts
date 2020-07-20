import BigNumber from '../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../../../interfaces/IAirGapTransaction'
import { stripHexPrefix } from '../../../../../utils/hex'
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SubstrateCallId } from '../../node/call/SubstrateCallId'
import { SubstrateAccountId } from '../account/SubstrateAddress'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEBytes } from '../scale/type/SCALEBytes'
import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { EraConfig, SCALEEra } from '../scale/type/SCALEEra'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEType } from '../scale/type/SCALEType'

import { SubstrateTransactionMethod } from './method/SubstrateTransactionMethod'
import { SubstrateSignature, SubstrateSignatureType } from './SubstrateSignature'

const VERSION = 4
const BIT_SIGNED = 128
const BIT_UNSIGNED = 128 // TODO: change to 0 if payment_queryInfo recognizes the transaction, at the moment it returns "No such variant in enum Call" error

interface SubstrateTransactionConfig {
  from: SubstrateAccountId
  args: any
  tip: number | BigNumber
  methodId: SubstrateCallId
  era: EraConfig | null
  nonce: number | BigNumber
  signature?: SubstrateSignature
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
  SUBMIT_BATCH
}

export class SubstrateTransaction extends SCALEClass {
  public static create(
    network: SubstrateNetwork,
    type: SubstrateTransactionType,
    config: SubstrateTransactionConfig
  ): SubstrateTransaction {
    return new SubstrateTransaction(
      network,
      type,
      SCALEAccountId.from(config.from, network),
      config.signature || SubstrateSignature.create(SubstrateSignatureType.Ed25519, config.signature),
      config.era ? SCALEEra.Mortal(config.era) : SCALEEra.Immortal(),
      SCALECompactInt.from(config.nonce),
      SCALECompactInt.from(config.tip),
      SubstrateTransactionMethod.create(network, type, config.methodId.moduleIndex, config.methodId.callIndex, config.args)
    )
  }

  public static fromTransaction(transaction: SubstrateTransaction, config?: Partial<SubstrateTransactionConfig>): SubstrateTransaction {
    return new SubstrateTransaction(
      transaction.network,
      transaction.type,
      config && config.from ? SCALEAccountId.from(config.from, transaction.network) : transaction.signer,
      config?.signature || transaction.signature,
      config && config.era ? SCALEEra.Mortal(config.era) : transaction.era,
      config && config.nonce ? SCALECompactInt.from(config.nonce) : transaction.nonce,
      config && config.tip ? SCALECompactInt.from(config.tip) : transaction.tip,
      config && config.args && config.methodId
        ? SubstrateTransactionMethod.create(
            transaction.network,
            transaction.type,
            config.methodId.moduleIndex,
            config.methodId.callIndex,
            config.args
          )
        : transaction.method
    )
  }

  public static decode(network: SubstrateNetwork, type: SubstrateTransactionType, raw: string): SCALEDecodeResult<SubstrateTransaction> {
    const bytes = SCALEBytes.decode(stripHexPrefix(raw))
    const decoder = new SCALEDecoder(network, bytes.decoded.bytes.toString('hex'))

    decoder.decodeNextHash(8) // signed byte
    const signer = decoder.decodeNextAccountId()
    const signature = decoder.decodeNextObject(SubstrateSignature.decode)
    const era = decoder.decodeNextEra()
    const nonce = decoder.decodeNextCompactInt()
    const tip = decoder.decodeNextCompactInt()
    const method = decoder.decodeNextObject((network, hex) => SubstrateTransactionMethod.decode(network, type, hex))

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
    readonly network: SubstrateNetwork,
    readonly type: SubstrateTransactionType,
    readonly signer: SCALEAccountId,
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
      extra: this.type !== SubstrateTransactionType.TRANSFER
        ? { type: SubstrateTransactionType[this.type] }
        : undefined,
      transactionDetails: JSON.parse(this.toString())
    }
    const parts = this.method.toAirGapTransactionParts()

    return parts.length > 0 ? parts.map((part) => Object.assign(airGapTransaction, part)) : [airGapTransaction]
  }

  protected _encode(): string {
    const typeEncoded = SCALEHash.from(new Uint8Array([VERSION | (this.signature.isSigned ? BIT_SIGNED : BIT_UNSIGNED)])).encode()
    const bytes = Buffer.from(
      typeEncoded + this.scaleFields.reduce((encoded: string, struct: SCALEType) => encoded + struct.encode(), ''),
      'hex'
    )

    return SCALEBytes.from(bytes).encode()
  }
}
