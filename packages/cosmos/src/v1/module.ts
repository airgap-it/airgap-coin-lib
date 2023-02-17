import { AirGapModule } from '@airgap/module-kit'
import { CosmosModule } from './module/CosmosModule'

export * from './index'

export function create(): AirGapModule {
  return new CosmosModule()
}
