export interface ConseilPredicate {
  field: string
  operation: 'in' | 'between' | 'like' | 'lt' | 'gt' | 'eq' | 'startsWith' | 'endsWith' | 'before' | 'after' | 'isnull'
  set: any[]
  inverse?: boolean
  group?: string
}
