import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'

import { Serializer } from '../../src'
import { InvalidHexString, InvalidSchemaType, InvalidString } from '../../src/errors'
import { SchemaRoot } from '../../src/serializer/schemas/schema'

import { AnyMessage } from './schemas/definitions/AnyMessage'
import { ArrayMessage } from './schemas/definitions/ArrayMessage'
import { BooleanMessage } from './schemas/definitions/BooleanMessage'
import { ComplexMessage } from './schemas/definitions/ComplexMessage'
import { HexMessage } from './schemas/definitions/HexMessage'
import { NumberMessage } from './schemas/definitions/NumberMessage'
import { ObjectMessage } from './schemas/definitions/ObjectMessage'
import { SimpleMessage } from './schemas/definitions/SimpleMessage'
import { StringMessage } from './schemas/definitions/StringMessage'
import { TupleMessage } from './schemas/definitions/TupleMessage'

const anyMessage: SchemaRoot = require('./schemas/generated/any-message.json')
const arrayMessage: SchemaRoot = require('./schemas/generated/array-message.json')
const booleanMessage: SchemaRoot = require('./schemas/generated/boolean-message.json')
const complexMessage: SchemaRoot = require('./schemas/generated/complex-message.json')
const hexMessage: SchemaRoot = require('./schemas/generated/hex-message.json')
const numberMessage: SchemaRoot = require('./schemas/generated/number-message.json')
const objectMessage: SchemaRoot = require('./schemas/generated/object-message.json')
const simpleMessage: SchemaRoot = require('./schemas/generated/simple-message.json')
const stringMessage: SchemaRoot = require('./schemas/generated/string-message.json')
const tupleMessage: SchemaRoot = require('./schemas/generated/tuple-message.json')

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

Serializer.addSchema(1000, { schema: anyMessage })
Serializer.addSchema(1001, { schema: arrayMessage })
Serializer.addSchema(1002, { schema: booleanMessage })
Serializer.addSchema(1003, { schema: complexMessage })
Serializer.addSchema(1004, { schema: hexMessage })
Serializer.addSchema(1005, { schema: numberMessage })
Serializer.addSchema(1006, { schema: objectMessage })
Serializer.addSchema(1007, { schema: simpleMessage })
Serializer.addSchema(1008, { schema: stringMessage })
Serializer.addSchema(1009, { schema: tupleMessage })

const serializer: Serializer = new Serializer()

const test = async <T>(type: number, payload: T, expectedError?: string): Promise<void> => {
  const message: any = {
    id: 'random__id',
    type,
    protocol: '',
    payload
  }

  try {
    const serialized1: string[] = await serializer.serialize([message])
    expect(serialized1.length).to.equal(1)
    expect(await serializer.deserialize(serialized1), 'full chunk').to.deep.eq([message])
  } catch (error) {
    if (!expectedError) {
      throw new Error(`Unexpected error with ${JSON.stringify(payload)}: ${error.toString()}`)
    }
    expect(error.toString()).to.equal(expectedError)
  }
}

describe(`Serializer`, async () => {
  // TODO: create an issue
  it('should correctly serialize and deserialize a string message', async () => {
    await test<StringMessage>(1008, {
      x: 'str1'
    })
    await test<StringMessage>(1008, {
      x: ''
    })
    await test<StringMessage>(
      1008,
      {
        x: '0x1234'
      },
      `${new InvalidString('string "0x1234" starts with "0x". This causes problems with RLP. Please use the "HexString" type instead of "string"')}`
    )
    await test<StringMessage>(
      1008,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
    await test<StringMessage>(
      1008,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "boolean", value: true')}`
    )
    await test<StringMessage>(
      1008,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "undefined", value: undefined')}`
    )
    await test<StringMessage>(
      1008,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: []')}`
    )
    await test<StringMessage>(
      1008,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: {}')}`
    )
  })

  it('should correctly serialize and deserialize a number message', async () => {
    await test<NumberMessage>(1005, {
      x: 1
    })
    await test<NumberMessage>(1005, {
      x: 0
    })
    await test<NumberMessage>(1005, {
      x: -1
    })
    await test<NumberMessage>(
      1005,
      {
        x: 'str1' as any
      },
      `${new InvalidSchemaType('x: expected type "number", but got "string", value: str1')}`
    )
    await test<NumberMessage>(
      1005,
      {
        x: '' as any
      },
      `${new InvalidSchemaType('x: expected type "number", but got "string", value: ')}`
    )
    await test<NumberMessage>(
      1005,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "number", but got "boolean", value: true')}`
    )
    await test<NumberMessage>(
      1005,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "number", but got "undefined", value: undefined')}`
    )
    await test<NumberMessage>(
      1005,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "number", but got "object", value: []')}`
    )
    await test<NumberMessage>(
      1005,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "number", but got "object", value: {}')}`
    )
  })

  it('should correctly serialize and deserialize a boolean message', async () => {
    await test<BooleanMessage>(1002, {
      x: true as any
    })
    await test<BooleanMessage>(1002, {
      x: false as any
    })
    await test<BooleanMessage>(
      1002,
      {
        x: 'str1' as any
      },
      `${new InvalidSchemaType('x: expected type "boolean", but got "string", value: str1')}`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: '' as any
      },
      `${new InvalidSchemaType('x: expected type "boolean", but got "string", value: ')}`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "boolean", but got "number", value: 1')}`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "boolean", but got "undefined", value: undefined')}`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "boolean", but got "object", value: []')}`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "boolean", but got "object", value: {}')}`
    )
  })

  it('should correctly serialize and deserialize an array message', async () => {
    await test<ArrayMessage>(1001, {
      x: []
    })
    await test<ArrayMessage>(1001, {
      x: ['str1', 'str2', 'str3']
    })
    await test<ArrayMessage>(
      1001,
      {
        x: ['str1', 1] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: [undefined, undefined] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: null')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: [1, 2, 3] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: 'str1' as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "string", value: str1')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: '' as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "string", value: ')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "number", value: 1')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "boolean", value: true')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "undefined", value: undefined')}`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "object", value: {}')}`
    )
  })

  it('should correctly serialize and deserialize an object message', async () => {
    await test<ObjectMessage>(1006, {
      x: {
        name: 'str1'
      } as any
    })
    await test<ObjectMessage>(
      1006,
      {
        x: {
          x: 1
        } as any
      },
      `${new InvalidSchemaType('name: expected type "string", but got "undefined", value: undefined')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('name: expected type "string", but got "undefined", value: undefined')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: 'str1' as any
      },
      `${new InvalidSchemaType('x: expected type "object", but got "string", value: str1')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: '' as any
      },
      `${new InvalidSchemaType('x: expected type "object", but got "string", value: ')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "object", but got "number", value: 1')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "object", but got "boolean", value: true')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "object", but got "undefined", value: undefined')}`
    )
    await test<ObjectMessage>(
      1006,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "object", but got "object", value: []')}`
    )
  })

  it('should correctly serialize and deserialize a hex message', async () => {
    await test<HexMessage>(1004, {
      x: '0x1234'
    })
    await test<HexMessage>(
      1004,
      {
        x: '' as any
      },
      `${new InvalidHexString('"" does not start with "0x"')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: 'str1'
      },
      `${new InvalidHexString('"str1" does not start with "0x"')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: {
          x: 1
        } as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: {"x":1}')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: {}')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "boolean", value: true')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "undefined", value: undefined')}`
    )
    await test<HexMessage>(
      1004,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: []')}`
    )
  })

  it('should correctly serialize and deserialize an any message', async () => {
    await test<AnyMessage>(1000, {
      x: 'str1'
    })
    await test<AnyMessage>(1000, {
      x: ''
    })
    await test<AnyMessage>(
      1000,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
    await test<AnyMessage>(
      1000,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "boolean", value: true')}`
    )
    await test<AnyMessage>(
      1000,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "undefined", value: undefined')}`
    )
    await test<AnyMessage>(
      1000,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: []')}`
    )
    await test<AnyMessage>(
      1000,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "object", value: {}')}`
    )
  })

  it('should correctly serialize and deserialize a tuple message', async () => {
    await test<TupleMessage>(1009, {
      x: ['str', 1, true, { name: 'str' }, ['str']]
    })
    await test<TupleMessage>(
      1009,
      {
        x: 'str1' as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "string", value: str1')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: 1 as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "number", value: 1')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: true as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "boolean", value: true')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: undefined as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "undefined", value: undefined')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: [] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "undefined", value: ')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: {} as any
      },
      `${new InvalidSchemaType('x: expected type "array", but got "object", value: {}')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: ['str', 1, true, { name: 1 } as any, []]
      },
      `${new InvalidSchemaType('name: expected type "string", but got "number", value: 1')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: [1, 'str', true, { name: 'str' }, []] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
    await test<TupleMessage>(
      1009,
      {
        x: ['str', 1, true, { name: 'str' }, [1]] as any
      },
      `${new InvalidSchemaType('x: expected type "string", but got "number", value: 1')}`
    )
  })

  it('should correctly serialize and deserialize a simple message', async () => {
    const payload: SimpleMessage = {
      name: '',
      test: 0,
      bool: false,
      obj: {
        name: '',
        test: 0,
        bool: false
      },
      arr1: ['str1', ''],
      arr2: [1, 0, 9999999999],
      arr3: [true, false]
    }

    await test(1007, payload)
  })

  it('should give an error if not all parameters are provided', async () => {
    try {
      const message = {
        id: 'random__id',
        type: 1003,
        protocol: '',
        payload: {
          name: 'test'
        } as ComplexMessage
      } as any

      await serializer.serialize([message])
    } catch (error) {
      expect(error.toString()).to.equal(
        `${new InvalidSchemaType('arr1: expected type "array", but got "undefined", value: undefined')}`
      )
    }
  })

  // Skipped because it's overflowing the JS heap
  it.skip('should serialize a complex, nested object', async () => {
    const payload: ComplexMessage = {
      name: 'str',
      test: 1,
      bool: true,
      obj1: {
        name: 'str',
        test: 1,
        bool: true
      },
      arr1: ['str1', 'str2'],
      arr2: [1, 2, 3, 4],
      arr3: [true, false, true],
      arr4: [
        {
          name: 'str',
          test: 1,
          bool: true
        }
      ],
      arr5: ['str1', 'str2', 'str3', 1, true, { name: 'str', test: 1, bool: true }],
      obj2: {
        name: 'str',
        test: 1,
        bool: true,
        obj1: {
          name: 'str',
          test: 1,
          bool: true
        },
        arr1: ['str1', 'str2'],
        arr2: [1, 2, 3, 4],
        arr3: [true, false, true],
        arr4: [{ name: 'str', test: 1, bool: true }],
        arr5: ['str1', 'str2', 'str3', 1, true, { name: 'str', test: 1, bool: true }]
      },
      obj3: { arr1: [[['str1']], [['str2'], ['str3', 'str4']]] },
      obj4: {
        arr1: [{ arr1: [{ name: 'str1' }] }, { arr1: [{ name: 'str1' }, { name: 'str2' }] }]
      }
    }

    const message: any = {
      id: 'random__id',
      type: 1003,
      protocol: '',
      payload
    }

    const serialized1: string[] = await serializer.serialize([message])
    expect(serialized1.length).to.equal(1)
    expect(await serializer.deserialize(serialized1), 'full chunk').to.deep.eq([message])

    const serialized2: string[] = await serializer.serialize([message], 200)
    expect(serialized2.length).to.equal(2)
    expect(await serializer.deserialize(serialized2), '200 byte chunks').to.deep.eq([message])

    const serialized3: string[] = await serializer.serialize([message], 20)
    expect(serialized3.length).to.equal(11)
    expect(await serializer.deserialize(serialized3), '20 byte chunks').to.deep.eq([message])

    const serialized4: string[] = await serializer.serialize([message], 1)
    expect(serialized4.length).to.equal(209)
    expect(await serializer.deserialize(serialized4), '1 byte chunks').to.deep.eq([message])
  })
})
