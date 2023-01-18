import { InvalidPayloadError, InvalidSchemaType, NotFoundError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { assertNever } from '@airgap/coinlib-core/utils/assert'

import { SchemaDefinition, SchemaItem, SchemaRoot, SchemaTypes } from '../schemas/schema'

import { CBORData } from './toBuffer'

const isHexString = (str: string) => {
  const regexp = /^[0-9a-fA-F]+$/

  if (regexp.test(str)) {
    return true
  } else {
    return false
  }
}

enum StringType {
  STRING_WITH_HEX_PREFIX = 0,
  HEX_WITH_PREFIX_EVEN = 1,
  HEX_WITHOUT_PREFIX_EVEN = 2,
  HEX_WITH_PREFIX_ODD = 3,
  HEX_WITHOUT_PREFIX_ODD = 4
}

function log(...args: unknown[]): void {
  const loggingEnabled: boolean = false
  if (loggingEnabled) {
    // tslint:disable-next-line:no-console
    console.log(...args)
  }
}

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
    `${key}: expected type "${expectedType}", but got "${typeof value}", value: ${
      typeof value === 'object' ? JSON.stringify(value) : value
    }`
  )
}

function checkType(key: string, expectedType: string, value: unknown, callback: (arg: any) => CBORData): CBORData {
  if (expectedType === 'array' && Array.isArray(value)) {
    return callback(value)
  } else if (typeof value === expectedType && !Array.isArray(value)) {
    return callback(value)
  } else {
    throw typeError(key, expectedType, value)
  }
}

function getTypeFromSchemaDefinition(schema: SchemaItem | undefined): SchemaTypes {
  return schema?.type ?? SchemaTypes.STRING
}

export function jsonToArray(key: string, schema: SchemaItem, value: Object): CBORData {
  const type: SchemaTypes = getTypeFromSchemaDefinition(schema)
  switch (type) {
    case SchemaTypes.STRING:
      return checkType(key, 'string', value, (arg: string): string | Buffer => {
        log(`Parsing key ${key} as string, which results in ${arg}`)

        let buf: Buffer | undefined
        let type: StringType | undefined

        if (arg.startsWith('0x')) {
          const argWithoutPrefix = arg.slice(2)
          if (isHexString(argWithoutPrefix)) {
            if (argWithoutPrefix.length % 2 === 0) {
              type = StringType.HEX_WITH_PREFIX_EVEN
              buf = Buffer.from(argWithoutPrefix, 'hex')
            } else {
              type = StringType.HEX_WITH_PREFIX_ODD
              buf = Buffer.from('0' + argWithoutPrefix, 'hex')
            }
          } else {
            type = StringType.STRING_WITH_HEX_PREFIX
            buf = Buffer.from(argWithoutPrefix)
          }
        } else {
          if (isHexString(arg)) {
            if (arg.length % 2 === 0) {
              type = StringType.HEX_WITHOUT_PREFIX_EVEN
              buf = Buffer.from(arg, 'hex')
            } else {
              type = StringType.HEX_WITHOUT_PREFIX_ODD
              buf = Buffer.from('0' + arg, 'hex')
            }
          } else {
            return arg
          }
        }

        const typeBuffer = Buffer.from(type.toString(16).padStart(2, '0'), 'hex')

        const concat = Buffer.concat([typeBuffer, buf])

        return concat
      })

    case SchemaTypes.NUMBER:
    case SchemaTypes.INTEGER:
      return checkType(key, 'number', value, (arg: number): number => {
        log(`Parsing key ${key} as number, which results in ${arg.toString()}`)

        return arg
      })

    case SchemaTypes.BOOLEAN:
      return checkType(key, 'boolean', value, (arg: boolean): boolean => {
        log(`Parsing key ${key} as boolean, which results in ${arg ? '1' : '0'}`)

        return arg
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

        const out: CBORData[] = []
        for (const propertyKey of keys) {
          out.push(jsonToArray(propertyKey, properties[propertyKey], arg[propertyKey]))
        }

        log(`Parsing key ${key} as object, which results in ${out}`)

        return out
      })

    default:
      assertNever(type)
      throw new InvalidSchemaType()
  }
}

function decode(schemaItem: SchemaItem, decoded: any): any {
  if (typeof decoded === 'undefined') {
    throw new InvalidPayloadError()
  }

  const type: SchemaTypes = getTypeFromSchemaDefinition(schemaItem)
  switch (type) {
    case SchemaTypes.BOOLEAN:
      if (decoded.toString() !== '') {
        return decoded
      }
      break

    case SchemaTypes.STRING:
      if (typeof decoded === 'string') {
        return decoded
      }

      const stringType: StringType = parseInt(decoded.slice(0, 1).toString('hex'), 16)

      switch (stringType) {
        case StringType.STRING_WITH_HEX_PREFIX:
          return `0x${decoded.slice(1).toString()}`
        case StringType.HEX_WITH_PREFIX_EVEN:
          return `0x${decoded.slice(1).toString('hex')}`
        case StringType.HEX_WITHOUT_PREFIX_EVEN:
          return decoded.slice(1).toString('hex')
        case StringType.HEX_WITH_PREFIX_ODD:
          return `0x${decoded.slice(1).toString('hex').slice(1)}`
        case StringType.HEX_WITHOUT_PREFIX_ODD:
          return decoded.slice(1).toString('hex').slice(1)

        default:
          assertNever(stringType)
          throw new Error('Cannot decode!')
      }

    case SchemaTypes.NUMBER:
    case SchemaTypes.INTEGER:
      if (decoded.toString() !== '') {
        return decoded
      }
      break

    case SchemaTypes.NULL:
      return undefined

    case SchemaTypes.ARRAY:
      return decoded.map((decodedElement: CBORData, index: number) => {
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
      throw new InvalidSchemaType()
  }
}

export function rlpArrayToJson(schema: SchemaItem, decoded: CBORData): { [key: string]: unknown } {
  const outObject: { [key: string]: unknown } = {}

  if (schema.type === SchemaTypes.OBJECT) {
    const newShema: SchemaItem | undefined = schema.properties
    if (newShema) {
      return rlpArrayToJson(newShema, decoded)
    } else {
      throw new NotFoundError(Domain.SERIALIZER, 'Schema not available.')
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
