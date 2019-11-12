// tslint:disable:no-console

import { IACMessageDefinitionObject } from '../../src/serializer/message'
import { Serializer } from '../../src/serializer/serializer'

const urls: string[] =
  ['s3esqztYz6j14zSxv53eKP18NUzkPoD7PGXTZirWKxVKfenfG7BiF4Vz',
  's3esqzvVjDhPsaGcirpa42nam8QcjxDZrGRiXV8QWtKEU5QPyQVowJrn',
  's3esqzxSUPmv2Nq3Dv4apqrkTGQMZNF33ALYTzGGjEW949Kt3A8eQfDH',
  'ekR2AcTWugF7V4tCF4yWjzXj2d']

const serializer: Serializer = new Serializer()

serializer
  .deserialize(urls)
  .then((sync: IACMessageDefinitionObject[]) => {
    console.log('decoded:', sync)
  })
  .catch((error: Error) => {
    console.error('DESERIALIZE ERROR:', error)
  })
