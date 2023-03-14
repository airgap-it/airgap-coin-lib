import { AirGapModule } from '@airgap/module-kit'
import { GroestlcoinModule } from './module/GroestlcoinModule'

export * from './index'

export function create(): AirGapModule {
  return new GroestlcoinModule()
}
