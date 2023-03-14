import { AirGapModule } from '@airgap/module-kit'
import { BitcoinModule } from './module/BitcoinModule'

export * from './index'

export function create(): AirGapModule {
  return new BitcoinModule()
}
