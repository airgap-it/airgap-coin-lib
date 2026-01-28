import { AirGapModule } from '@airgap/module-kit'
import { BnbModule } from './module/BnbModule'

export * from './index'

export function create(): AirGapModule {
  return new BnbModule()
}
