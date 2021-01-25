// tslint:disable:no-console

import { IACMessageDefinitionObject } from '../../packages/core/src/serializer/message'
import { Serializer } from '../../packages/core/src/serializer/serializer'

const urls: string[] = [
  'UV9La4L9iqSztUbkKAE6tGeeTixJuam5wNaybVk3fJQYaZh6hUiRpXeXRzJ9TCXTuptahAx6WM97VH7VB7NjU9aQgmbN9MogwhZSyW6e7k2B9m8AGxLqBdENyp8Vq22EYpeb1xTgNfaSfwDwsJWJURiZvPat1bCTJj7iLWKBtvNqFjtgVABAbmk2RWjogXtwyZVfaENYLR3PP8WAhJZZ6dHM4WJA7VaNb22rreiS4td8vMA4e2mvUfJ1gB18inJY1DvY1JyeJUnujc2XBmAYTuAeoSGwxQkpUnScnucmzsk1xJik9FYztmZi1T86AS8znrMKZhwSGrzTCXVk8DnYhwp4bm3YhPzVLLbpvHYev1Nk3LNWtyNt9HjCScyQBYN9365kyWM6L28cemfqZzidPXzNcZnibgnvsXX6k1h6v77yFCbg5JXqk7UeaY4r7nMGhX1JuBvcSsEahDXMAmfJVo3NFZVCj4TKKZXsLZ1ByPVEgz2cyUoJjn13G5X8SQCPBWam4MBm17dQcJq9N33HnWhn7nGncjVat2gUEKXc94ZV'
]

const serializer: Serializer = new Serializer()

serializer
  .deserialize(urls)
  .then((sync: IACMessageDefinitionObject[]) => {
    console.log('decoded:', sync)
  })
  .catch((error: Error) => {
    console.error('DESERIALIZE ERROR:', error)
  })
