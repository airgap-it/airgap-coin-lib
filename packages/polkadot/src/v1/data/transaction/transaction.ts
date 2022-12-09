import { PolkadotProtocolConfiguration } from '../../types/configuration'

import { factories } from './method/args'

export const TRANSACTION_TYPES: PolkadotProtocolConfiguration['transaction']['types'] = {
  bond: { ...factories('bond'), index: 1 },
  unbond: { ...factories('unbond'), index: 2 },
  rebond: { ...factories('rebond'), index: 3 },
  bond_extra: { ...factories('bond_extra'), index: 4 },
  withdraw_unbonded: { ...factories('withdraw_unbonded'), index: 5 },
  nominate: { ...factories('nominate'), index: 6 },
  cancel_nomination: { ...factories('cancel_nomination'), index: 7 },
  collect_payout: { ...factories('collect_payout'), index: 8 },
  set_payee: { ...factories('set_payee'), index: 9 },
  set_controller: { ...factories('set_controller'), index: 10 }
}
