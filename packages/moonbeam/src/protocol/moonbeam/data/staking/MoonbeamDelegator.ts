// tslint:disable: max-classes-per-file
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { DecoderMethod, SCALEDecoder, SCALEDecodeResult } from '@airgap/substrate/protocol/common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '@airgap/substrate/protocol/common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '@airgap/substrate/protocol/common/data/scale/type/SCALEArray'
import { SCALEClass } from '@airgap/substrate/protocol/common/data/scale/type/SCALEClass'
import { SCALEEnum } from '@airgap/substrate/protocol/common/data/scale/type/SCALEEnum'
import { SCALEInt } from '@airgap/substrate/protocol/common/data/scale/type/SCALEInt'
import { SCALEType } from '@airgap/substrate/protocol/common/data/scale/type/SCALEType'
import { SubstrateNetwork } from '@airgap/substrate/protocol/SubstrateNetwork'

import { MoonbeamBond } from './MoonbeamBond'

export enum MoonbeamDelegatorStatusRaw {
  ACTIVE = 0,
  LEAVING
}

export abstract class MoonbeamDelegatorStatus extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MoonbeamDelegatorStatus> {
    const prefix = parseInt(raw.substring(0, 2), 16)

    let decoderMethod: DecoderMethod<MoonbeamDelegatorStatus, Network>
    switch (prefix) {
      case MoonbeamDelegatorStatusRaw.ACTIVE:
        decoderMethod = MoonbeamDelegatorStatusActive.decode
        break
      case MoonbeamDelegatorStatusRaw.LEAVING:
        decoderMethod = MoonbeamDelegatorStatusLeaving.decode
        break
      default:
        throw new InvalidValueError(Domain.SUBSTRATE, 'Unknown Moonbeam delegator status')
    }

    const decoded = decoderMethod(network, runtimeVersion, raw.slice(2))

    return {
      bytesDecoded: 1 + decoded.bytesDecoded,
      decoded: decoded.decoded
    }
  }

  public abstract readonly type: SCALEEnum<MoonbeamDelegatorStatusRaw>
  protected abstract readonly _scaleFields: SCALEType[]

  protected get scaleFields(): SCALEType[] {
    return [this.type, ...this._scaleFields]
  }
}

export class MoonbeamDelegatorStatusActive extends MoonbeamDelegatorStatus {
  public static decode<Network extends SubstrateNetwork>(
    _network: Network,
    _runtimeVersion: number | undefined,
    _raw: string
  ): SCALEDecodeResult<MoonbeamDelegatorStatusActive> {
    return {
      bytesDecoded: 0,
      decoded: new MoonbeamDelegatorStatusActive()
    }
  }

  public readonly type: SCALEEnum<MoonbeamDelegatorStatusRaw> = SCALEEnum.from(MoonbeamDelegatorStatusRaw.ACTIVE)
  protected readonly _scaleFields: SCALEType[] = []
}

export class MoonbeamDelegatorStatusLeaving extends MoonbeamDelegatorStatus {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MoonbeamDelegatorStatusLeaving> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const roundIndex = decoder.decodeNextInt(32)

    return {
      bytesDecoded: roundIndex.bytesDecoded,
      decoded: new MoonbeamDelegatorStatusLeaving(roundIndex.decoded)
    }
  }

  public readonly type: SCALEEnum<MoonbeamDelegatorStatusRaw> = SCALEEnum.from(MoonbeamDelegatorStatusRaw.LEAVING)
  protected readonly _scaleFields: SCALEType[] = []

  constructor(public readonly roundIndex: SCALEInt) {
    super()
  }
}

export class MoonbeamDelegator {
  public static decode(runtimeVersion: number | undefined, raw: string): MoonbeamDelegator {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const id = decoder.decodeNextAccountId(20)
    const delegations = decoder.decodeNextArray((_, runtimeVersion, hex) => MoonbeamBond.decode(runtimeVersion, hex))
    const total = decoder.decodeNextInt(128)
    const lessTotal = decoder.decodeNextInt(128)
    const status = decoder.decodeNextObject(MoonbeamDelegatorStatus.decode)

    return new MoonbeamDelegator(id.decoded, delegations.decoded, total.decoded, lessTotal.decoded, status.decoded)
  }

  private constructor(
    public readonly id: SCALEAccountId<SubstrateNetwork.MOONBEAM>,
    public readonly delegations: SCALEArray<MoonbeamBond>,
    public readonly total: SCALEInt,
    public readonly lessTotal: SCALEInt,
    public readonly status: MoonbeamDelegatorStatus
  ) {}
}
