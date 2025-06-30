import { AirGapModule } from '@airgap/module-kit'
import { StellarModule } from './module/StellarModule'

export * from './index'

export function create(): AirGapModule {
  return new StellarModule()
}
