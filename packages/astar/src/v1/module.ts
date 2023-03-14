import { AirGapModule } from '@airgap/module-kit'
import { AstarModule } from './module/AstarModule'

export * from './index'

export function create(): AirGapModule {
  return new AstarModule()
}
