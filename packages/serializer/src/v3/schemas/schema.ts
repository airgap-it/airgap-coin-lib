export type SchemaTransformer = (value: any) => any

export enum SchemaTypes {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  NULL = 'null',
  ARRAY = 'array',
  OBJECT = 'object'
}

export interface SchemaRoot {
  $ref: string
  $schema: string
  definitions: SchemaDefinition
}

export interface SchemaItem {
  $ref?: string
  type?: SchemaTypes
  additionalProperties?: boolean
  properties?: SchemaItem
  required?: string[]
}

export interface SchemaDefinition {
  [key: string]: SchemaItem
}

export interface SchemaInfo {
  schema: SchemaRoot
  transformer?: SchemaTransformer // Use generic type
}
