import { AirGapModule } from '@airgap/module-kit'
import { CoreumModule } from './module/CoreumModule'

export * from './index'

export function create(): AirGapModule {
  return new CoreumModule()
}
