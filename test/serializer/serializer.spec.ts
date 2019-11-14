import { expect } from 'chai'
import 'mocha'

var URL = require('url').URL

import { Serializer } from '../../src/serializer/serializer'

interface DataToUrlInput {
  data: string[]
  host?: string
  parameter?: string
}

type DataToUrlOutput = string

type UrlToDataInput = {
  url: string
  parameter: string
}

type UrlToDataOutput = string[]

interface TestCase<T, U> {
  input: T
  output: U
}

type DataToUrlTestCase = TestCase<DataToUrlInput, DataToUrlOutput>
type UrlToDataTestCase = TestCase<UrlToDataInput, UrlToDataOutput>

const data: DataToUrlTestCase[] = [
  { input: { data: ['a', 'b', 'c'] }, output: 'airgap-wallet://?d=a,b,c' },
  { input: { data: [] }, output: 'airgap-wallet://?d=' },
  { input: { data: ['a'], parameter: '' }, output: 'airgap-wallet://?=a' },
  { input: { data: ['a'], host: 'https://wallet.airgap.it/' }, output: 'https://wallet.airgap.it/?d=a' },
  { input: { data: ['1'], host: 'https://wallet.airgap.it/', parameter: 'test' }, output: 'https://wallet.airgap.it/?test=1' }
]

const dataToUrl: DataToUrlTestCase[] = [{ input: { data: [1 as any] }, output: 'airgap-wallet://?d=1' }]
const UrlToData: UrlToDataTestCase[] = [
  { input: { url: 'airgap-wallet://?d=1', parameter: 'd' }, output: ['1'] },
  { input: { url: 'airgap-wallet://?d=1', parameter: 'a' }, output: [] },
  { input: { url: 'airgap-wallet://?d=1', parameter: '' }, output: [] }
]

describe(`Serializer`, () => {
  data.forEach(async (element: DataToUrlTestCase) => {
    it('should correctly convert data to a URL: ' + element.input.data, async () => {
      const url = Serializer.serializedDataToUrlString(element.input.data, element.input.host, element.input.parameter)
      expect(url).to.equal(element.output)
    })

    it('should correctly convert a URL to data: ' + element.output, async () => {
      const url = Serializer.serializedDataToUrlString(element.input.data, element.input.host, element.input.parameter)
      const deserialized = Serializer.urlStringToSerializedData(url, element.input.parameter)
      expect(element.input.data).to.deep.equal(deserialized)
    })
  })
  dataToUrl.forEach(async (element: DataToUrlTestCase) => {
    it('one-way: should correctly convert data to a URL: ' + element.input.data, async () => {
      const url = Serializer.serializedDataToUrlString(element.input.data, element.input.host, element.input.parameter)
      expect(url).to.equal(element.output)
    })
  })
  UrlToData.forEach(async (element: UrlToDataTestCase) => {
    it('one-way: should correctly convert a URL to data: ' + element.input.url, async () => {
      const deserialized = Serializer.urlStringToSerializedData(element.input.url, element.input.parameter)
      expect(element.output).to.deep.equal(deserialized)
    })
  })
})
