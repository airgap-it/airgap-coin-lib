import { ConseilPredicate } from './ConseilPredicate'

export interface BigMapPredicate extends ConseilPredicate {
  field: 'account_id' | 'big_map_id' | 'key' | 'key_hash' | 'value' | 'value_type' | 'key_type'
}
