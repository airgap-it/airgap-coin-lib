// tslint:disable:no-console

import { IACMessageDefinitionObject } from '../../src/serializer/v2/message'
import { Serializer } from '../../src/serializer/v2/serializer.new'

const url: string =
  'NDdvRykiZcgZDjNx5APzGRFLiELmSEQpfKEJea8YiRZPFtpL1mNP7UjFmUuqdmrdTxQHGaydKu5ocyYL5G6Ag58ToTXXn5L5aCUtp9FkXHqH5MtLwBy9JmwxW7CeE3F7QS5ZHwofNnBw4XwUw'

const serializer: Serializer = new Serializer()

serializer
  .deserialize([url])
  .then((sync: IACMessageDefinitionObject[]) => {
    console.log('decoded:', sync)
  })
  .catch((error: Error) => {
    console.error('DESERIALIZE ERROR:', error)
  })
