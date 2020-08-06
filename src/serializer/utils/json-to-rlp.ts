import { InvalidSchemaType } from '../../errors'
import { SchemaDefinition, SchemaItem, SchemaRoot, SchemaTypes } from '../schemas/schema'

import { RLPData } from './toBuffer'

function log(...args: unknown[]): void {
  const loggingEnabled: boolean = true
  if (loggingEnabled) {
    // tslint:disable-next-line:no-console
    console.log(...args)
  }
}

const assertNever: (x: never) => void = (x: never): void => undefined

export function getDefinitionByRefPath(schema: SchemaRoot, refPath: string): SchemaItem {
  const mainDefinitionName: string = refPath.split('/').slice(-1)[0]

  const definitions: SchemaDefinition = schema.definitions

  return definitions[mainDefinitionName]
}

export function unwrapSchema(schema: SchemaRoot): SchemaItem {
  log('UNWRAPPING SCHEMA', schema)

  return getDefinitionByRefPath(schema, schema.$ref)
}

function typeError(key: string, expectedType: string, value: unknown): Error {
  return new InvalidSchemaType(
    `${key}: expected type "${expectedType}", but got "${typeof value}", ${typeof value === 'object' ? JSON.stringify(value) : value}`
  )
}

function checkType<T>(key: string, expectedType: string, value: unknown, callback: (arg: any) => RLPData): RLPData {
  if (expectedType === 'array' && Array.isArray(value)) {
    return callback(value)
  } else if (typeof value === expectedType) {
    return callback(value)
  } else if (typeof value === 'undefined') {
    return ''
  } else {
    throw typeError(key, expectedType, value)
  }
}

function getTypeFromSchemaDefinition(schema: SchemaItem | undefined): SchemaTypes {
  return schema?.type ?? /* schema?.$ref === "#/definitions/HexString" ? */ SchemaTypes.HEX_STRING
}

export function jsonToArray(key: string, schema: SchemaItem, value: Object): RLPData {
  const type: SchemaTypes = getTypeFromSchemaDefinition(schema)
  switch (type) {
    case SchemaTypes.STRING:
      return checkType(key, 'string', value, (arg: string): string => {
        log(`Parsing key ${key} as string, which results in ${arg}`)

        return arg
      })

    case SchemaTypes.HEX_STRING:
      return checkType(key, 'string', value, (arg: string): string => {
        log(`Parsing key ${key} as string, which results in ${arg}`)

        return arg.substr(2) // Remove the '0x'
      })

    case SchemaTypes.NUMBER:
    case SchemaTypes.INTEGER:
      return checkType(key, 'number', value, (arg: number): string => {
        log(`Parsing key ${key} as number, which results in ${arg.toString()}`)

        return arg.toString()
      })

    case SchemaTypes.BOOLEAN:
      return checkType(key, 'boolean', value, (arg: boolean): string => {
        log(`Parsing key ${key} as boolean, which results in ${arg ? '1' : '0'}`)

        return arg ? '1' : '0'
      })

    case SchemaTypes.NULL:
      if (typeof value === 'undefined') {
        log(`Parsing key ${key} as undefined, which results in ''`)

        return ''
      } else {
        throw typeError(key, 'undefined', value)
      }

    case SchemaTypes.ARRAY:
      return checkType(key, 'array', value, (arg) => {
        return arg.map((element, index) => {
          const items = (schema as any).items
          if (Array.isArray(items)) {
            return jsonToArray(key, items[index], element)
          } else {
            return jsonToArray(key, items, element)
          }
        })
      })

    case SchemaTypes.OBJECT:
      return checkType(key, 'object', value, (arg) => {
        const properties: Object = (schema as any).properties
        const keys: string[] = Object.keys(properties).sort()

        const out: RLPData[] = []
        for (const propertyKey of keys) {
          out.push(jsonToArray(propertyKey, properties[propertyKey], arg[propertyKey]))
        }

        log(`Parsing key ${key} as object, which results in ${out}`)

        return out
      })

    default:
      assertNever(type)

      return ''
  }
}

function decode(schemaItem: SchemaItem, decoded: any): any {
  const type: SchemaTypes = getTypeFromSchemaDefinition(schemaItem)
  switch (type) {
    case SchemaTypes.BOOLEAN:
      if (decoded.toString() !== '') {
        return decoded.toString() === '1'
      }
      break

    case SchemaTypes.STRING:
      return decoded.toString()

    case SchemaTypes.HEX_STRING:
      return `0x${decoded.toString()}`

    case SchemaTypes.NUMBER:
    case SchemaTypes.INTEGER:
      if (decoded.toString() !== '') {
        return parseInt(decoded.toString(), 10)
      }
      break

    case SchemaTypes.NULL:
      return undefined

    case SchemaTypes.ARRAY:
      return decoded.map((decodedElement: RLPData, index: number) => {
        const items = (schemaItem as any).items
        if (Array.isArray(items)) {
          return decode(items[index], decodedElement)
        } else {
          return decode(items, decodedElement)
        }
      })

    case SchemaTypes.OBJECT:
      return rlpArrayToJson((schemaItem as any).properties, decoded)

    default:
      assertNever(type)
  }
}

export function rlpArrayToJson(schema: SchemaItem, decoded: RLPData): { [key: string]: unknown } {
  const outObject: { [key: string]: unknown } = {}

  if (schema.type === SchemaTypes.OBJECT) {
    const newShema: SchemaItem | undefined = schema.properties
    if (newShema) {
      return rlpArrayToJson(newShema, decoded)
    } else {
      throw new Error('Shema not available.')
    }
  }

  const keys: string[] = Object.keys(schema).sort()

  log(keys)

  for (let i: number = 0; i < keys.length; i++) {
    const key: string = keys[i]
    log(schema)
    outObject[key] = decode(schema[key], decoded[i])
  }

  return outObject
}
