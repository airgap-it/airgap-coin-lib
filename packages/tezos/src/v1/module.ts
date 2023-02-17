import { AirGapModule } from '@airgap/module-kit'
import { TezosModule } from './module/TezosModule'

export * from './index'

export function create(): AirGapModule {
  return new TezosModule()
}
