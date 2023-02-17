import { AirGapModule } from '@airgap/module-kit'
import { ICPModule } from './module/ICPModule'

export * from './index'

export function create(): AirGapModule {
  return new ICPModule()
}
