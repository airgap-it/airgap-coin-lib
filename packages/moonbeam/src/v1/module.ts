import { AirGapModule } from '@airgap/module-kit'
import { MoonbeamModule } from './module/MoonbeamModule'

export * from './index'

export function create(): AirGapModule {
  return new MoonbeamModule()
}
