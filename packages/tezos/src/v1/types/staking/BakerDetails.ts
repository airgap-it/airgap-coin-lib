import { Amount } from '@airgap/module-kit'

import { TezosUnits } from '../protocol'

export interface BakerDetails {
  balance: Amount<TezosUnits>
  delegatedBalance: Amount<TezosUnits>
  stakingBalance: Amount<TezosUnits>
  selfBond: Amount<TezosUnits>
  bakerCapacity: string
  bakerUsage: string
}
