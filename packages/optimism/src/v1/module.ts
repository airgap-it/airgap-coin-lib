import { AirGapModule } from '@airgap/module-kit'
import { OptimismModule } from './module/OptimismModule'

export * from './index'

export function create(): AirGapModule {
  return new OptimismModule()
}
