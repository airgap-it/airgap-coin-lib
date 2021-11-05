import { HttpRemoteData } from './HttpRemoteData'
import { IpfsRemoteData } from './IpfsRemoteData'
import { RemoteData } from './RemoteData'
import { Sha256RemoteData } from './Sha256RemoteData'

type Validator = (uri: string) => boolean
type Factory = <T>(uri: string, extra?: unknown) => RemoteData<T> | undefined

export class RemoteDataFactory {
  protected readonly factoriesWithValidators: [Validator, Factory][] = [
    [HttpRemoteData.validate, (uri: string, _extra: unknown) => HttpRemoteData.from(uri)],
    [IpfsRemoteData.validate, (uri: string, _extra: unknown) => IpfsRemoteData.from(uri)],
    [Sha256RemoteData.validate, (uri: string, _extra: unknown) => Sha256RemoteData.from(uri)]
  ]

  public constructor(extraFactoriesWithValidators: [Validator, Factory][] = []) {
    this.factoriesWithValidators.push(...extraFactoriesWithValidators)
  }

  public create<T>(uri: string, extra?: unknown): RemoteData<T> | undefined {
    const [, factory] = this.factoriesWithValidators.find(([validator, _]) => validator(uri)) ?? [undefined, undefined]

    return factory ? factory(uri, extra) : undefined
  }
}
