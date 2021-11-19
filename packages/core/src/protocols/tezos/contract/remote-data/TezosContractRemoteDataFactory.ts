import { RemoteDataFactory } from '../../../../utils/remote-data/RemoteDataFactory'
import { TezosStorageRemoteData } from './TezosStorageRemoteData'

export class TezosContractRemoteDataFactory extends RemoteDataFactory {
  public constructor() {
    super([
      [
        TezosStorageRemoteData.validate,
        (uri: string, extra: unknown) => {
          const contract = extra instanceof Object ? extra['contract'] : undefined
          if (!contract) {
            return undefined
          }

          return TezosStorageRemoteData.create(uri, contract)
        }
      ]
    ])
  }
}
