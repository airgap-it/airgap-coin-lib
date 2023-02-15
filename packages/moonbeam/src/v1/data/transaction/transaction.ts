import { MoonbeamProtocolConfiguration } from '../../types/configuration'

import { factories } from './method/args'

export const TRANSACTION_TYPES: MoonbeamProtocolConfiguration['transaction']['types'] = {
  delegate: { ...factories('delegate'), index: 12 },
  schedule_leave_delegators: { ...factories('schedule_leave_delegators'), index: 13 },
  execute_leave_delegators: { ...factories('execute_leave_delegators'), index: 14 },
  cancel_leave_delegators: { ...factories('cancel_leave_delegators'), index: 15 },
  schedule_revoke_delegation: { ...factories('schedule_revoke_delegation'), index: 16 },
  execute_delegation_request: { ...factories('execute_delegation_request'), index: 17 },
  cancel_delegation_request: { ...factories('cancel_delegation_request'), index: 18 },
  delegator_bond_more: { ...factories('delegator_bond_more'), index: 19 },
  schedule_delegator_bond_less: { ...factories('schedule_delegator_bond_less'), index: 20 },
  execute_candidate_bond_less: { ...factories('execute_candidate_bond_less'), index: 21 },
  cancel_candidate_bond_less: { ...factories('cancel_candidate_bond_less'), index: 22 }
}
