import { AirGapModule } from '@airgap/module-kit'
import { EthereumModule } from './module/EthereumModule'

export * from './index'

export function create(): AirGapModule {
  return new EthereumModule()
}
