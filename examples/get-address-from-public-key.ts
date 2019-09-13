// tslint:disable:no-console

import { TezosProtocol } from '../src'

const protocol: TezosProtocol = new TezosProtocol()

protocol
  .getAddressFromPublicKey('700d993c90aa176d3513d32c8ba411258631d8b15856dbec7b1b45398092c718')
  .then((result: string) => {
    console.log(result)
  })
  .catch((error: Error) => {
    console.error(error)
  })
