import * as rlp from 'rlp'

import { Schema } from '../v2/schemas/schema'

function log(...args) {
  const loggingEnabled = false
  if (loggingEnabled) {
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
  OBJECT = 'object'
}

const assertNever: (x: never) => void = (x: never): void => undefined

export function unwrapSchema(schema: Schema): any {
  log('UNWRAPPING SCHEMA', schema)
  const definitions: Object = (schema as any).definitions
  const definitionKeys: string[] = Object.keys(definitions)
  if (definitionKeys.length !== 1) {
    throw new Error('INVALID SCHEMA, MORE THAN ONE DEFINITION')
  }

  return definitions[definitionKeys[0]]
}

function typeError(key: string, expectedType: string, value: any): Error {
  return new Error(`${key}: expected type "${expectedType}", but got "${typeof value}"`)
}

function checkType<T>(key: string, expectedType: string, value: unknown, callback: ((arg: any) => string | string[])): any {
  if (typeof value === expectedType) {
    return callback(value)
  } else if (typeof value === 'undefined') {
    return ''
  } else {
    throw typeError(key, expectedType, value)
  }
}

export function jsonToRlp(schema: Object, json: Object): Buffer {
  const array = jsonToArray('root', schema, json)

  log('BEFORE RLP', array)

  const rlpEncoded: Buffer = rlp.encode(array) as any // TODO: As any can be removed with new RLP version

  log('RLP', rlpEncoded)

  return rlpEncoded
}

export function jsonToArray(key: string, schema: Object, value: Object): string | string[] | any {
  const type: SchemaTypes = (schema as any).type
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
        return arg.map(element => jsonToArray(key, schema, element))
      })

    case SchemaTypes.OBJECT:
      return checkType(key, 'object', value, arg => {
        const properties: Object = (schema as any).properties
        const keys: string[] = Object.keys(properties).sort()

        const out: string[] = []
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

export function rlpToJson<T>(schema: Object, rlpEncoded: string): T | undefined {
  const array: any[] = rlp.decode(rlpEncoded)
  const type: SchemaTypes = (schema as any).type

  switch (type) {
    case SchemaTypes.STRING:
    case SchemaTypes.NUMBER:
    case SchemaTypes.INTEGER:
    case SchemaTypes.BOOLEAN:
    case SchemaTypes.NULL:
      return rlpArrayToJson(schema, array)

    case SchemaTypes.ARRAY:
      // TODO: Implement
      // return arrayToJson(schema, array as any)
      throw new Error('ARRAY TYPE NOT IMPLEMENTED')

    case SchemaTypes.OBJECT:
      return rlpArrayToJson((schema as any).properties, array)

    default:
      assertNever(type)

      return undefined
  }
}

export function rlpArrayToJson(schema: Object, decoded: any[]): any {
  const outObject = {}

  const keys: string[] = Object.keys(schema).sort()
  log(keys)
  for (let i: number = 0; i < keys.length; i++) {
    const key: string = keys[i]
    const type: SchemaTypes = schema[key].type
    switch (type) {
      case SchemaTypes.BOOLEAN:
        if (decoded[i].toString() !== '') {
          outObject[key] = decoded[i].toString() === '1'
        }
        break

      case SchemaTypes.STRING:
        outObject[key] = decoded[i].toString()
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
        // TODO: Implement
        outObject[key] = rlpArrayToJson(schema[key].properties, decoded[i])
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
