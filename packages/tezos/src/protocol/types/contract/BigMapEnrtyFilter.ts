export interface BigMapEntryFilter {
  field: 'key' | 'value'
  operation: 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le' | 'as' | 'un' | 'in' | 'ni' | 'null'
  value: string
}
