import { AirGapModule } from '@airgap/module-kit'
import { AeternityModule } from './module/AeternityModule'

export * from './index'

export function create(): AirGapModule {
  return new AeternityModule()
}
