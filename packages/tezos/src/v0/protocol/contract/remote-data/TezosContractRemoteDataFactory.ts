import { RemoteDataFactory, RemoteDataFactoryExtra } from '@airgap/coinlib-core/utils/remote-data/RemoteDataFactory'

import { TezosProtocolNetworkResolver } from '../../TezosProtocolOptions'
import { TezosContract } from '../TezosContract'

import { TezosStorageRemoteData } from './TezosStorageRemoteData'

interface TezosContractRemoteDataFactoryExtra extends RemoteDataFactoryExtra {
  contract: TezosContract
  networkResolver?: TezosProtocolNetworkResolver
}

export class TezosContractRemoteDataFactory extends RemoteDataFactory<TezosContractRemoteDataFactoryExtra> {
  public constructor() {
    super([
      [
        TezosStorageRemoteData.validate,
        (uri: string, extra: TezosContractRemoteDataFactoryExtra) => {
          return TezosStorageRemoteData.create(uri, extra.contract, extra.networkResolver)
        }
      ]
    ])
  }
}
