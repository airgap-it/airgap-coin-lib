import { HttpRemoteData } from './HttpRemoteData'
import { IpfsRemoteData } from './IpfsRemoteData'
import { RemoteData } from './RemoteData'
import { Sha256RemoteData } from './Sha256RemoteData'

type Validator = (uri: string) => boolean
type Factory<T> = <S>(uri: string, extra: T) => RemoteData<S> | undefined

export interface RemoteDataFactoryExtra {}

export class RemoteDataFactory<T extends RemoteDataFactoryExtra = any> {
  protected readonly factoriesWithValidators: [Validator, Factory<T>][] = [
    [HttpRemoteData.validate, (uri: string, _extra: T) => HttpRemoteData.from(uri)],
    [IpfsRemoteData.validate, (uri: string, _extra: T) => IpfsRemoteData.from(uri)],
    [Sha256RemoteData.validate, (uri: string, _extra: T) => Sha256RemoteData.from(uri)]
  ]

  public constructor(extraFactoriesWithValidators: [Validator, Factory<T>][] = []) {
    this.factoriesWithValidators.push(...extraFactoriesWithValidators)
  }

  public create<S>(uri: string, extra: T): RemoteData<S> | undefined {
    const [, factory] = this.factoriesWithValidators.find(([validator, _]) => validator(uri)) ?? [undefined, undefined]

    return factory ? factory(uri, extra) : undefined
  }
}
