import { AirGapModule } from '@airgap/module-kit'
import { PolkadotModule } from './module/PolkadotModule'

export * from './index'

export function create(): AirGapModule {
  return new PolkadotModule()
}
