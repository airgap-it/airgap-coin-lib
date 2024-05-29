import { AirGapModule } from '@airgap/module-kit'
import { AcurastModule } from './module/AcurastModule'

export * from './index'

export function create(): AirGapModule {
  return new AcurastModule()
}
