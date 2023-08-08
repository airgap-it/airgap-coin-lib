import { AirGapModule } from '@airgap/module-kit'
import { MinaModule } from './module/MinaModule'

export * from './index'

export function create(): AirGapModule {
  return new MinaModule()
}
