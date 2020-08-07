import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import 'mocha'

import { Serializer } from '../../src'
import { SchemaRoot } from '../../src/serializer/schemas/schema'

// import { AnyMessage } from './schemas/AnyMessage'
import { ArrayMessage } from './schemas/ArrayMessage'
import { BooleanMessage } from './schemas/BooleanMessage'
import { ComplexMessage } from './schemas/ComplexMessage'
import { NumberMessage } from './schemas/NumberMessage'
import { ObjectMessage } from './schemas/ObjectMessage'
import { SimpleMessage } from './schemas/SimpleMessage'
import { StringMessage } from './schemas/StringMessage'

const anyMessage: SchemaRoot = require('./schemas/generated/any-message.json')
const arrayMessage: SchemaRoot = require('./schemas/generated/array-message.json')
const booleanMessage: SchemaRoot = require('./schemas/generated/boolean-message.json')
const complexMessage: SchemaRoot = require('./schemas/generated/complex-message.json')
const numberMessage: SchemaRoot = require('./schemas/generated/number-message.json')
const objectMessage: SchemaRoot = require('./schemas/generated/object-message.json')
const simpleMessage: SchemaRoot = require('./schemas/generated/simple-message.json')
const stringMessage: SchemaRoot = require('./schemas/generated/string-message.json')

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect: Chai.ExpectStatic = chai.expect

Serializer.addSchema((1000).toString(), { schema: anyMessage })
Serializer.addSchema((1001).toString(), { schema: arrayMessage })
Serializer.addSchema((1002).toString(), { schema: booleanMessage })
Serializer.addSchema((1003).toString(), { schema: complexMessage })
Serializer.addSchema((1004).toString(), { schema: numberMessage })
Serializer.addSchema((1005).toString(), { schema: objectMessage })
Serializer.addSchema((1006).toString(), { schema: simpleMessage })
Serializer.addSchema((1007).toString(), { schema: stringMessage })

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
      throw new Error(`Unexpected error ${error.toString()}`)
    }
    expect(error.toString()).to.equal(expectedError)
  }
}

describe(`Serializer`, async () => {
  it('should correctly serialize and deserialize a string message', async () => {
    await test<StringMessage>(1007, {
      x: 'str1'
    })
    await test<StringMessage>(1007, {
      x: ''
    })
    await test<StringMessage>(
      1007,
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
    )
    await test<StringMessage>(
      1007,
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "boolean", value: true`
    )
    await test<StringMessage>(
      1007,
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "undefined", value: undefined`
    )
    await test<StringMessage>(
      1007,
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: []`
    )
    await test<StringMessage>(
      1007,
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: {}`
    )
  })

  it('should correctly serialize and deserialize a number message', async () => {
    await test<NumberMessage>(1004, {
      x: 1
    })
    await test<NumberMessage>(1004, {
      x: 0
    })
    await test<NumberMessage>(1004, {
      x: -1
    })
    await test<NumberMessage>(
      1004,
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "string", value: str1`
    )
    await test<NumberMessage>(
      1004,
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "string", value: `
    )
    await test<NumberMessage>(
      1004,
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "boolean", value: true`
    )
    await test<NumberMessage>(
      1004,
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "undefined", value: undefined`
    )
    await test<NumberMessage>(
      1004,
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "object", value: []`
    )
    await test<NumberMessage>(
      1004,
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "object", value: {}`
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
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "string", value: str1`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "string", value: `
    )
    await test<BooleanMessage>(
      1002,
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "number", value: 1`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "undefined", value: undefined`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "object", value: []`
    )
    await test<BooleanMessage>(
      1002,
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "object", value: {}`
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
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: [undefined, undefined] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: null`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: [1, 2, 3] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "string", value: str1`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "string", value: `
    )
    await test<ArrayMessage>(
      1001,
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "number", value: 1`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "boolean", value: true`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "undefined", value: undefined`
    )
    await test<ArrayMessage>(
      1001,
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "object", value: {}`
    )
  })

  it('should correctly serialize and deserialize an object message', async () => {
    await test<ObjectMessage>(1005, {
      x: {
        name: 'str1'
      } as any
    })
    await test<ObjectMessage>(
      1005,
      {
        x: {
          x: 1
        } as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): name: expected type "string", but got "undefined", value: undefined`
    )
    await test<ObjectMessage>(
      1005,
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): name: expected type "string", but got "undefined", value: undefined`
    )
    await test<ObjectMessage>(
      1005,
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "string", value: str1`
    )
    await test<ObjectMessage>(
      1005,
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "string", value: `
    )
    await test<ObjectMessage>(
      1005,
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "number", value: 1`
    )
    await test<ObjectMessage>(
      1005,
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "boolean", value: true`
    )
    await test<ObjectMessage>(
      1005,
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "undefined", value: undefined`
    )
    await test<ObjectMessage>(
      1005,
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "object", value: []`
    )
  })

  // it('should correctly serialize and deserialize an any message', async () => {
  //   await test<AnyMessage>(1000, {
  //     x: 'str1'
  //   })
  //   await test<AnyMessage>(1000, {
  //     x: ''
  //   })
  //   await test<AnyMessage>(
  //     1000,
  //     {
  //       x: 1 as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
  //   )
  //   await test<AnyMessage>(
  //     1000,
  //     {
  //       x: true as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "boolean", value: true`
  //   )
  //   await test<AnyMessage>(
  //     1000,
  //     {
  //       x: undefined as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "undefined", value: undefined`
  //   )
  //   await test<AnyMessage>(
  //     1000,
  //     {
  //       x: [] as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: []`
  //   )
  //   await test<AnyMessage>(
  //     1000,
  //     {
  //       x: {} as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: {}`
  //   )
  // })

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

    await test(1006, payload)
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
        'Error: serializer(INVALID_SCHEMA_TYPE): arr1: expected type "array", but got "undefined", value: undefined'
      )
    }
  })

  it('should serialize a complex, nested object', async () => {
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

    const message = {
      id: 'random__id',
      type: 1003,
      protocol: '',
      payload
    } as any

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
