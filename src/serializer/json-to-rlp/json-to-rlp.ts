import { RLPData } from '../utils/toBuffer'

import { InvalidSchema, InvalidSchemaType } from '../errors'
import { Schema } from '../v2/schemas/schema'

function log(...args: unknown[]): void {
  const loggingEnabled: boolean = false
  if (loggingEnabled) {
    // tslint:disable-next-line:no-console
    console.log(args)
  }
}

enum SchemaTypes {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  NULL = 'null',
  ARRAY = 'array',
  OBJECT = 'object',
  HEX_STRING = 'hexString' // TODO: Should we do it like that?
}

const assertNever: (x: never) => void = (x: never): void => undefined

export function unwrapSchema(schema: Schema): any {
  log('UNWRAPPING SCHEMA', schema)

  const definitions: Object = (schema as any).definitions
  const definitionKeys: string[] = Object.keys(definitions)

  let extraDefinitions: number = 0 // TODO: Make generic
  if (definitionKeys.includes('HexString')) {
    extraDefinitions++

    return definitions[definitionKeys[1]]
  }

  if (definitionKeys.length !== 1 + extraDefinitions) {
    throw new InvalidSchema('Not exactly one Schema is defined')
  }

  return definitions[definitionKeys[0]]
}

function typeError(key: string, expectedType: string, value: unknown): Error {
  return new InvalidSchemaType(
    `${key}: expected type "${expectedType}", but got "${typeof value}", ${typeof value === 'object' ? JSON.stringify(value) : value}`
  )
}

function checkType<T>(key: string, expectedType: string, value: unknown, callback: ((arg: any) => RLPData)): RLPData {
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

function getTypeFromSchemaDefinition(schema: any): SchemaTypes {
  return schema?.type ?? /* schema?.$ref === "#/definitions/HexString" ? */ SchemaTypes.HEX_STRING
}

export function jsonToArray(key: string, schema: Object, value: Object): RLPData {
  const type: SchemaTypes = getTypeFromSchemaDefinition(schema)
  switch (type) {
    case SchemaTypes.STRING:
      return checkType(
        key,
        'string',
        value,
        (arg: string): string => {
          log(`Parsing key ${key} as string, which results in ${arg}`)

          return arg
        }
      )

      case SchemaTypes.HEX_STRING:
        return checkType(
          key,
          'string',
          value,
          (arg: string): string => {
            log(`Parsing key ${key} as string, which results in ${arg}`)
  
            return arg.substr(2) // Remove the '0x'
          }
        )
  
    case SchemaTypes.NUMBER:
    case SchemaTypes.INTEGER:
      return checkType(
        key,
        'number',
        value,
        (arg: number): string => {
          log(`Parsing key ${key} as number, which results in ${arg.toString()}`)

          return arg.toString()
        }
      )

    case SchemaTypes.BOOLEAN:
      return checkType(
        key,
        'boolean',
        value,
        (arg: boolean): string => {
          log(`Parsing key ${key} as boolean, which results in ${arg ? '1' : '0'}`)

          return arg ? '1' : '0'
        }
      )

    case SchemaTypes.NULL:
      if (typeof value === 'undefined') {
        log(`Parsing key ${key} as undefined, which results in ''`)

        return ''
      } else {
        throw typeError(key, 'undefined', value)
      }

    case SchemaTypes.ARRAY:
      return checkType(key, 'array', value, arg => {
        return arg.map(element => jsonToArray(key, (schema as any).items, element))
      })

    case SchemaTypes.OBJECT:
      return checkType(key, 'object', value, arg => {
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

export function rlpArrayToJson(schema: Object, decoded: any[]): any {
  const outObject = {}

  const keys: string[] = Object.keys(schema).sort()
  log(keys)
  for (let i: number = 0; i < keys.length; i++) {
    const key: string = keys[i]
    const type: SchemaTypes = getTypeFromSchemaDefinition(schema[key])
    switch (type) {
      case SchemaTypes.BOOLEAN:
        if (decoded[i].toString() !== '') {
          outObject[key] = decoded[i].toString() === '1'
        }
        break

      case SchemaTypes.STRING:
        outObject[key] = decoded[i].toString()
        break

      case SchemaTypes.HEX_STRING:
        outObject[key] = `0x${decoded[i].toString()}`
        break

      case SchemaTypes.NUMBER:
      case SchemaTypes.INTEGER:
        if (decoded[i].toString() !== '') {
          outObject[key] = parseInt(decoded[i].toString(), 10)
        }
        break

      case SchemaTypes.NULL:
        outObject[key] = undefined
        break

      case SchemaTypes.ARRAY:
        outObject[key] = decoded[i].map(decodedElement => rlpArrayToJson(schema[key].items.properties, decodedElement))
        break

      case SchemaTypes.OBJECT:
        outObject[key] = rlpArrayToJson(schema[key].properties, decoded[i])
        break

      default:
        assertNever(type)

        return undefined
    }
  }

  return outObject
}
