export interface BigMapPredicate {
  field: 'account_id' | 'big_map_id' | 'key' | 'key_hash' | 'value' | 'value_type' | 'key_type'
  operation: 'in' | 'between' | 'like' | 'lt' | 'gt' | 'eq' | 'startsWith' | 'endsWith' | 'before' | 'after' | 'isnull'
  set: any[]
  inverse?: boolean
}