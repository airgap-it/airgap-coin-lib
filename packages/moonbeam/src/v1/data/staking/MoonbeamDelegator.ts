// tslint:disable: max-classes-per-file
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { SCALEAccountId, SCALEArray, SCALEClass, SCALEEnum, SCALEInt, SCALEType } from '@airgap/substrate/v1'
import { DecoderMethod, SCALEDecoder, SCALEDecodeResult } from '@airgap/substrate/v1/data/scale/SCALEDecoder'

import { MoonbeamProtocolConfiguration } from '../../types/configuration'

import { MoonbeamBond } from './MoonbeamBond'

export enum MoonbeamDelegatorStatusRaw {
  ACTIVE = 0,
  LEAVING
}

export abstract class MoonbeamDelegatorStatus extends SCALEClass {
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MoonbeamDelegatorStatus> {
    const prefix = parseInt(raw.substring(0, 2), 16)

    let decoderMethod: DecoderMethod<MoonbeamDelegatorStatus, C>
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

    const decoded = decoderMethod(configuration, runtimeVersion, raw.slice(2))

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
  public static decode<C extends MoonbeamProtocolConfiguration>(
    _configuration: C,
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
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MoonbeamDelegatorStatusLeaving> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

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

export class MoonbeamDelegator<C extends MoonbeamProtocolConfiguration = MoonbeamProtocolConfiguration> {
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): MoonbeamDelegator<C> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const id = decoder.decodeNextAccountId(20)
    const delegations = decoder.decodeNextArray((configuration, runtimeVersion, hex) =>
      MoonbeamBond.decode(configuration, runtimeVersion, hex)
    )
    const total = decoder.decodeNextInt(128)
    const lessTotal = decoder.decodeNextInt(128)
    const status = decoder.decodeNextObject(MoonbeamDelegatorStatus.decode)

    return new MoonbeamDelegator(id.decoded, delegations.decoded, total.decoded, lessTotal.decoded, status.decoded)
  }

  private constructor(
    public readonly id: SCALEAccountId<C>,
    public readonly delegations: SCALEArray<MoonbeamBond<C>>,
    public readonly total: SCALEInt,
    public readonly lessTotal: SCALEInt,
    public readonly status: MoonbeamDelegatorStatus
  ) {}
}
