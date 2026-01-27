import { AirGapModule } from '@airgap/module-kit'
import { BaseModule } from './module/BaseModule'

export * from './index'

export function create(): AirGapModule {
  return new BaseModule()
}
