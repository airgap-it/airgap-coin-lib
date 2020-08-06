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

Serializer.addSchema('any-message', { schema: anyMessage })
Serializer.addSchema('array-message', { schema: arrayMessage })
Serializer.addSchema('boolean-message', { schema: booleanMessage })
Serializer.addSchema('complex-message', { schema: complexMessage })
Serializer.addSchema('number-message', { schema: numberMessage })
Serializer.addSchema('object-message', { schema: objectMessage })
Serializer.addSchema('simple-message', { schema: simpleMessage })
Serializer.addSchema('string-message', { schema: stringMessage })

const serializer: Serializer = new Serializer()

const test = async <T>(type: string, payload: T, expectedError?: string): Promise<void> => {
  const message: any = {
    id: '43e5a42b-375d-451f-a39e-7a8ade553c1f',
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

describe.only(`Serializer`, async () => {
  it('should correctly serialize and deserialize a string message', async () => {
    await test<StringMessage>('string-message', {
      x: 'str1'
    })
    await test<StringMessage>('string-message', {
      x: ''
    })
    await test<StringMessage>(
      'string-message',
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
    )
    await test<StringMessage>(
      'string-message',
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "boolean", value: true`
    )
    await test<StringMessage>(
      'string-message',
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "undefined", value: undefined`
    )
    await test<StringMessage>(
      'string-message',
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: []`
    )
    await test<StringMessage>(
      'string-message',
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: {}`
    )
  })

  it('should correctly serialize and deserialize a number message', async () => {
    await test<NumberMessage>('number-message', {
      x: 1
    })
    await test<NumberMessage>('number-message', {
      x: 0
    })
    await test<NumberMessage>('number-message', {
      x: -1
    })
    await test<NumberMessage>(
      'number-message',
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "string", value: str1`
    )
    await test<NumberMessage>(
      'number-message',
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "string", value: `
    )
    await test<NumberMessage>(
      'number-message',
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "boolean", value: true`
    )
    await test<NumberMessage>(
      'number-message',
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "undefined", value: undefined`
    )
    await test<NumberMessage>(
      'number-message',
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "object", value: []`
    )
    await test<NumberMessage>(
      'number-message',
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "number", but got "object", value: {}`
    )
  })

  it('should correctly serialize and deserialize a boolean message', async () => {
    await test<BooleanMessage>('boolean-message', {
      x: true as any
    })
    await test<BooleanMessage>('boolean-message', {
      x: false as any
    })
    await test<BooleanMessage>(
      'boolean-message',
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "string", value: str1`
    )
    await test<BooleanMessage>(
      'boolean-message',
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "string", value: `
    )
    await test<BooleanMessage>(
      'boolean-message',
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "number", value: 1`
    )
    await test<BooleanMessage>(
      'boolean-message',
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "undefined", value: undefined`
    )
    await test<BooleanMessage>(
      'boolean-message',
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "object", value: []`
    )
    await test<BooleanMessage>(
      'boolean-message',
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "boolean", but got "object", value: {}`
    )
  })

  it('should correctly serialize and deserialize an array message', async () => {
    await test<ArrayMessage>('array-message', {
      x: []
    })
    await test<ArrayMessage>('array-message', {
      x: ['str1', 'str2', 'str3']
    })
    await test<ArrayMessage>(
      'array-message',
      {
        x: ['str1', 1] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: [undefined, undefined] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: null`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: [1, 2, 3] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "string", value: str1`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "string", value: `
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "number", value: 1`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "boolean", value: true`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "undefined", value: undefined`
    )
    await test<ArrayMessage>(
      'array-message',
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "array", but got "object", value: {}`
    )
  })

  it('should correctly serialize and deserialize an object message', async () => {
    await test<ObjectMessage>('object-message', {
      x: {
        name: 'str1'
      } as any
    })
    await test<ObjectMessage>(
      'object-message',
      {
        x: {
          x: 1
        } as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): name: expected type "string", but got "undefined", value: undefined`
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: {} as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): name: expected type "string", but got "undefined", value: undefined`
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: 'str1' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "string", value: str1`
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: '' as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "string", value: `
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: 1 as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "number", value: 1`
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: true as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "boolean", value: true`
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: undefined as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "undefined", value: undefined`
    )
    await test<ObjectMessage>(
      'object-message',
      {
        x: [] as any
      },
      `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "object", but got "object", value: []`
    )
  })

  // it('should correctly serialize and deserialize an any message', async () => {
  //   await test<AnyMessage>('any-message', {
  //     x: 'str1'
  //   })
  //   await test<AnyMessage>('any-message', {
  //     x: ''
  //   })
  //   await test<AnyMessage>(
  //     'any-message',
  //     {
  //       x: 1 as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "number", value: 1`
  //   )
  //   await test<AnyMessage>(
  //     'any-message',
  //     {
  //       x: true as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "boolean", value: true`
  //   )
  //   await test<AnyMessage>(
  //     'any-message',
  //     {
  //       x: undefined as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "undefined", value: undefined`
  //   )
  //   await test<AnyMessage>(
  //     'any-message',
  //     {
  //       x: [] as any
  //     },
  //     `Error: serializer(INVALID_SCHEMA_TYPE): x: expected type "string", but got "object", value: []`
  //   )
  //   await test<AnyMessage>(
  //     'any-message',
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

    await test('simple-message', payload)
  })

  it('should give an error if not all parameters are provided', async () => {
    try {
      const message = {
        id: '43e5a42b-375d-451f-a39e-7a8ade553c1f',
        type: 'complex-message',
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
      id: '43e5a42b-375d-451f-a39e-7a8ade553c1f',
      type: 'complex-message',
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
    expect(serialized3.length).to.equal(13)
    expect(await serializer.deserialize(serialized3), '20 byte chunks').to.deep.eq([message])

    const serialized4: string[] = await serializer.serialize([message], 1)
    expect(serialized4.length).to.equal(246)
    expect(await serializer.deserialize(serialized4), '1 byte chunks').to.deep.eq([message])
  })
})
